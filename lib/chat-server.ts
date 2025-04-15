import { query } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read: boolean
  sender_name?: string
  sender_role?: string
}

export async function getMessages(userId: string, adminId: string) {
  try {
    const messages = await query(
      `SELECT m.*, 
        CONCAT(u.first_name, ' ', u.last_name) as sender_name,
        u.role as sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.recipient_id = ?) 
          OR (m.sender_id = ? AND m.recipient_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, adminId, adminId, userId],
    )

    return messages as Message[]
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}

export async function sendMessage(senderId: string, recipientId: string, content: string) {
  try {
    const messageId = uuidv4()

    await query(
      `INSERT INTO messages (id, sender_id, recipient_id, content, created_at, read)
       VALUES (?, ?, ?, ?, NOW(), 0)`,
      [messageId, senderId, recipientId, content],
    )

    return { id: messageId }
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export async function markMessagesAsRead(userId: string, senderId: string) {
  try {
    await query(
      `UPDATE messages 
       SET read = 1
       WHERE recipient_id = ? AND sender_id = ? AND read = 0`,
      [userId, senderId],
    )

    return { success: true }
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }
}

export async function getUserChats(userId: string) {
  try {
    // Get all unique conversations for this user
    const chats = await query(
      `SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.role,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND recipient_id = ? AND read = 0) as unread_count,
        (SELECT content FROM messages WHERE (sender_id = ? AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = ? AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM users u
       WHERE u.id IN (
         SELECT DISTINCT 
           CASE 
             WHEN sender_id = ? THEN recipient_id
             ELSE sender_id
           END as chat_user
         FROM messages
         WHERE sender_id = ? OR recipient_id = ?
       )
       ORDER BY last_message_time DESC`,
      [userId, userId, userId, userId, userId, userId, userId, userId],
    )

    return chats
  } catch (error) {
    console.error("Error fetching user chats:", error)
    throw error
  }
}

export async function getAdminChats() {
  try {
    // Get all unique user conversations for admin
    const chats = await query(
      `SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.role,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND recipient_id = 'admin' AND read = 0) as unread_count,
        (SELECT content FROM messages WHERE (sender_id = 'admin' AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = 'admin') ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = 'admin' AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = 'admin') ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM users u
       WHERE u.role = 'user' AND u.id IN (
         SELECT DISTINCT 
           CASE 
             WHEN sender_id = 'admin' THEN recipient_id
             ELSE sender_id
           END as chat_user
         FROM messages
         WHERE sender_id = 'admin' OR recipient_id = 'admin'
       )
       ORDER BY last_message_time DESC`,
      [],
    )

    return chats
  } catch (error) {
    console.error("Error fetching admin chats:", error)
    throw error
  }
}

