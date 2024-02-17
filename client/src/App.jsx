import { useEffect, useState } from 'react'

function App() {

  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/api')
      .then((response) => {
        console.log(response)
        return response.text()
      })
      .then((data) => {
        console.log(data)
        setData(data)
      })
  }, [])

  return (
    <div>
      <h1>My React App!</h1>
      <p>{data}</p>
    </div>
  )
}

export default App