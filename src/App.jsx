import { useState } from 'react'
import Header from './components/header'
import Content from './components/content'
import './App.css'

function App() {
  const [active, setActive] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [priority, setPriority] = useState("");
  return (
    <>
      <Header setActive={setActive} active={active} boardName={boardName} setPriority={setPriority}/>
      <Content setActive={setActive} active={active} setBoardName={setBoardName} boardName={boardName} priority={priority}/>
    </>
  )
}

export default App