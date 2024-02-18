import { useEffect, useState } from 'react'

function App() {

  const [data, setData] = useState(null)

  useEffect(() => {

    const requestBody = {
      game_id: "gameId",
      player_name: "username",
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };


    fetch('http://localhost:8000/api/create-game', options)
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