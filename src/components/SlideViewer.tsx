import { useParams } from 'react-router-dom'

export function SlideViewer() {
  const { id } = useParams<{ id: string }>()

  // TODO: Fetch slide data by ID
  console.log('Slide ID:', id)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center py-16 text-white">
          <h1 className="text-4xl font-bold mb-4">スライドビューア</h1>
          <p className="text-xl text-gray-300">
            スライドID: {id}
          </p>
          <p className="text-gray-400 mt-4">
            ここにReveal.jsベースのスライドプレゼンテーションが表示されます
          </p>
        </div>
      </div>
    </div>
  )
}