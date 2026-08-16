import React, { use } from 'react'
import { useState, useEffect } from 'react';
import '../css/content.css'

const content = (props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [board, setBoard] = useState([]);
    const [loadBoard, setLoadBoard] = useState("");
    const [createNew, setCreateNew] = useState(false);
    const [todo, setTodo] = useState([]);
    const [inProgress, setInProgress] = useState([]);
    const [done, setDone] = useState([]);
    const [error, setError] = useState("");
    const [editingTask, setEditingTask] = useState("");
    const [editFlag, setEditFlag] = useState(false);

    useEffect(() => {
        const fetchBoard = async () => {
            const response = await fetch("https://taskflow-qwce.onrender.com/boards");
            const data = await response.json();
            console.log(data);
            setBoard(data);
        }

        fetchBoard();
    }, []);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                let url = "https://taskflow-qwce.onrender.com/task/" + props.priority
                if (props.priority === 'all') {
                    url = "https://taskflow-qwce.onrender.com/task";
                }
                const response = await fetch(url)
                const data = await response.json();

                const todoTasks = [];
                const inProgressTasks = [];
                const doneTasks = [];

                data.forEach((task) => {
                    if (task.name === 'To Do') {
                        todoTasks.push(task);
                    } else if (task.name === 'In Progress') {
                        inProgressTasks.push(task);
                    } else if (task.name === 'Done') {
                        doneTasks.push(task);
                    }
                });

                setTodo([])
                setInProgress([])
                setDone([])

                setTodo(todoTasks);
                setInProgress(inProgressTasks);
                setDone(doneTasks);
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            }
        };
        fetchTask();
    }, [props.priority]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("https://taskflow-qwce.onrender.com/task");
                const data = await response.json();

                const todoTasks = [];
                const inProgressTasks = [];
                const doneTasks = [];

                data.forEach((task) => {
                    if (task.name === 'To Do') {
                        todoTasks.push(task);
                    } else if (task.name === 'In Progress') {
                        inProgressTasks.push(task);
                    } else if (task.name === 'Done') {
                        doneTasks.push(task);
                    }
                });

                setTodo(todoTasks);
                setInProgress(inProgressTasks);
                setDone(doneTasks);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
            }
        };

        fetchTasks();
    }, []);

    const handleBoardName = async (e) => {
        e.preventDefault();
        setTodo([])
        setInProgress([])
        setDone([])

        const formData = new FormData(e.target);
        props.setBoardName(formData.get('boardname'));

        const data = Object.fromEntries(formData.entries());

        const response = await fetch("https://taskflow-qwce.onrender.com/addboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Server response:", result);
    }

    const handleDelete = async (taskId) => {
        try {
            const response = await fetch(`https://taskflow-qwce.onrender.com/task/delete/${taskId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setTodo((prev) => prev.filter((task) => task.id !== taskId));

        } catch (err) {
            console.log(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            console.log("Editing Task Id: " + editingTask.id)
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(`https://taskflow-qwce.onrender.com/task/update/${editingTask.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const result = await response.json();
            console.log("Server response:", result);

            // update the right column's state with the edited task
            setTodo((prev) =>
                prev.map((task) => (task.id === result.id ? result : task))
            );

            setEditingTask(""); // close the edit form
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        if (editFlag) {
            handleUpdate(e);
            return
        }

        try {
            const formData = new FormData(e.target);

            if (formData.get('column') === 'To Do') {
                setTodo((prev) => [
                    ...prev,
                    {
                        title: formData.get('title'),
                        description: formData.get('description'),
                        priority: formData.get('priority'),
                        created_at: getCurrentDateTime()
                    },
                ]);
            }

            if (formData.get('column') === 'In Progress') {
                setInProgress((prev) => [
                    ...prev,
                    {
                        title: formData.get('title'),
                        description: formData.get('description'),
                        priority: formData.get('priority'),
                        created_at: getCurrentDateTime()
                    },
                ]);
            }

            if (formData.get('column') === 'Done') {
                setDone((prev) => [
                    ...prev,
                    {
                        title: formData.get('title'),
                        description: formData.get('description'),
                        priority: formData.get('priority'),
                        created_at: getCurrentDateTime()
                    },
                ]);
            }

            const data = Object.fromEntries(formData.entries());

            const payload = {
                ...data,
                board_name: props.boardName
            };

            const response = await fetch("https://taskflow-qwce.onrender.com/addtask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const result = await response.json();
            console.log("Server response:", result);

            e.target.reset();
        } catch (error) {
            if (error instanceof TypeError) {
                console.log("Server is not working");
                setError("Server is not working");
            } else {
                setError(error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const storeBoard = (e) => {
        setLoadBoard(e.target.value);
        console.log(e.target.value)
    }

    const loadTodos = async (e) => {
        props.setBoardName(loadBoard)
        console.log(e.target.value)
        const response = await fetch("https://taskflow-qwce.onrender.com/task");
        const data = await response.json();
        console.log(data);

        const todoTasks = [];
        const inProgressTasks = [];
        const doneTasks = [];

        data.forEach((task) => {
            if (task.name === 'To Do') {
                todoTasks.push(task);
            } else if (task.name === 'In Progress') {
                inProgressTasks.push(task);
            } else if (task.name === 'Done') {
                doneTasks.push(task);
            }
        });

        setTodo(todoTasks);
        setInProgress(inProgressTasks);
        setDone(doneTasks);
    }


    function hideTask() {
        props.setActive(false)
        setEditFlag(false)
    }

    function getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleString("sv-SE").replace("T", " ");
    }

    return (
        <>
            <div className="board-name-entry" style={{ display: props.boardName ? "none" : "flex" }}>
                <div className="board-form">
                    <h3 className='board-heading'>New Board</h3>
                    <p>Give your board a name to get started</p>
                    <form onSubmit={handleBoardName}>
                        {!createNew && <p>Select your board</p>}
                        {!createNew && <select name="boardName" className='board-name-input' onChange={storeBoard}>
                            <option value="none">Select your board</option>
                            {board.map((item, index) => (
                                <option key={index} value={item.board_name}>{item.board_name}</option>
                            ))}
                        </select>
                        }
                        {!createNew && <p className='create-board' onClick={() => setCreateNew(true)}>Create a new board</p>}
                        {createNew && <input type="text" name='boardname' className='board-name-input' placeholder='e.g. Product Launch' />}
                        {createNew && <p className='create-board' onClick={() => setCreateNew(false)}>Select existing board</p>}
                        <div className="board-btn-box">
                            {createNew && <button className='createboard-btn'>Create board</button>}
                            {!createNew && <button type='button' className='createboard-btn' onClick={loadTodos} >Open board</button>}
                        </div>
                    </form>
                </div>
            </div>
            <div className="board-box">
                <div className="to-do-box">
                    <div className="column-top">
                        <div className="dot-1">
                            <span></span>
                        </div>
                        <div>To Do</div>
                    </div>
                    {todo.length > 0 ? todo.map((task, index) => (
                        <div key={index} className={"task-box " + task.priority}>
                            <div className="task-name-box">
                                <p className='task-name'>{task.title}</p>
                                <div className="icon-btn">
                                    <img src="src\assets\edit.svg" alt="" className='edit-img' onClick={() => {
                                        setEditFlag(true)
                                        setEditingTask(task)
                                        props.setActive(true)
                                    }} />
                                    <img src="src\assets\bin.svg" alt="" onClick={() => handleDelete(task.id)} />
                                </div>
                            </div>
                            <p className="description">{task.description}</p>
                            <div className="task-info">
                                <div className={"priority " + task.priority + "-tag"}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                                <div className="date">{task.created_at}</div>
                            </div>
                        </div>
                    )) : ""
                    }
                </div>
                <div className="progress-box">
                    <div className="column-top">
                        <div className="dot-2">
                            <span></span>
                        </div>
                        <div>In Progress</div>
                    </div>
                    {inProgress.length > 0 ? inProgress.map((task, index) => (
                        <div key={index} className={"task-box " + task.priority}>
                            <div className="task-name-box">
                                <p className='task-name'>{task.title}</p>
                                <div className="icon-btn">
                                    <img src="src\assets\edit.svg" alt="" className='edit-img' onClick={() => {
                                        setEditingTask(task)
                                        props.setActive(true)
                                    }} />
                                    <img src="src\assets\bin.svg" alt="" onClick={() => handleDelete(task.id)} />
                                </div>
                            </div>
                            <p className="description">{task.description}</p>
                            <div className="task-info">
                                <div className={"priority " + task.priority + "-tag"}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                                <div className="date">{task.created_at}</div>
                            </div>
                        </div>
                    )) : ""
                    }
                </div>
                <div className="done-box">
                    <div className="column-top">
                        <div className="dot-3">
                            <span></span>
                        </div>
                        <div>Done</div>
                    </div>
                    {done.length > 0 ? done.map((task, index) => (
                        <div key={index} className={"task-box " + task.priority}>
                            <div className="task-name-box">
                                <p className='task-name'>{task.title}</p>
                                <div className="icon-btn">
                                    <img src="src\assets\edit.svg" alt="" className='edit-img' onClick={() => {
                                        setEditingTask(task)
                                        props.setActive(true)
                                    }} />
                                    <img src="src\assets\bin.svg" alt="" onClick={() => handleDelete(task.id)} />
                                </div>
                            </div>
                            <p className="description">{task.description}</p>
                            <div className="task-info">
                                <div className={"priority " + task.priority + "-tag"}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                                <div className="date">{task.created_at}</div>
                            </div>
                        </div>
                    )) : ""
                    }
                </div>
            </div>
            <div className="input-task-box" style={{ display: props.active ? "flex" : "none" }}>
                <div className="task-form">
                    <h3>New Task</h3>
                    {error && (<div className="error-message">{error}</div>)}
                    <form onSubmit={handleSubmit}>
                        <p>TITLE</p>
                        <input required type="text" name='title' className='title-input' placeholder='e.g. Fix UI bug' defaultValue={editingTask.title} />
                        <p>DESCRIPTION</p>
                        <textarea name="description" className='desc-input' placeholder='Add any useful detail...' defaultValue={editingTask.description}></textarea>
                        <div className="form-drop-box">
                            <div className='select-box-1'>
                                <p>PRIORITY</p>
                                <select required name="priority" className='priority-box' defaultValue={editingTask.priority}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div required className='select-box-2'>
                                <p>COLUMN</p>
                                <select name="column" className='column'>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-btn-box">
                            <button type='button' className='cancel-btn' onClick={hideTask}>Cancel</button>
                            <button className='save-btn' disabled={isSubmitting}>{isSubmitting ? "Submitting" : "Save Task"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default content
