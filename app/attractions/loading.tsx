export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
}

