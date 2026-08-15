import React from 'react'
import '../css/header.css'

const header = (props) => {
    function addTask() {
        props.setActive(true)
    }

  return (
    <>
    <div className="header">
        <div className="left-side">
            <h3>TaskFlow</h3>
            <p>/</p>
            <p>{props.boardName ? props.boardName : "project-name"}</p>
        </div>
        <div className="right-side">
            <select name="priority" id="drop-menu" onChange={(e) => props.setPriority(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
            </select>
            <button className='addTask-btn' onClick={addTask}>New Task</button>
        </div>
    </div>
    <div className="border-bottom"></div>
    </>
  )
}

export default header