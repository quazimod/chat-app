
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {FormEvent, ReactElement, ReactNode, useEffect, useRef, useState} from "react";
import axios from "axios";

type ChatType = {
    id: number
    users: UserType[]
    messages: MessageType[]
}

type UserType = {
    id: number
    name: string
}

type MessageType = {
    id: number
    message: string
    sender_id: number
}

type ShowMenuState = {
    show: boolean
    mainSettings: boolean
}

export default function Messages({ chats, user }: { chats: ChatType[], user: UserType }): ReactNode {
    const [activeChat, setActiveChat] = useState(1)
    const [messages, setMessages] = useState<MessageType[]>([])
    const [messageText, setMessageText] = useState<string>("")
    const [searchedUsers, setSearchedUsers] = useState<UserType[]>([])
    const [showMenu, setShowMenu] = useState<ShowMenuState>({
        show: false,
        mainSettings: false
    })

    const showPrefsBtnRef = useRef<HTMLButtonElement>(null)
    const prefsPanelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        axios.get(`/messages/${ activeChat }`)
            .then((res) => setMessages(res.data))
    }, [activeChat]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (showPrefsBtnRef.current && !showPrefsBtnRef.current.contains(event.target as Node)
                && prefsPanelRef.current && !prefsPanelRef.current.contains(event.target as Node)) {
                setShowMenu({...showMenu, show: false})
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const messagesElems: ReactElement[] = messages.map(message => {
        let messageStyle: string = "w-2/3 rounded-lg my-1"
        messageStyle = message.sender_id === user.id ? messageStyle + ' float-right bg-white' : messageStyle + ' float-left bg-green-300'

        return (<div className={ messageStyle } key={ message.id        }>
            <p className="p-3">{ message.message }</p>
        </div>)
    })


    const sendMessage = () => {
        axios.post(`/messages/${activeChat}`, {message: messageText})
            // @ts-ignore
            .then(res => setMessages(prev => [...prev, res.data]))
    }

    const searchUsers = (e: FormEvent<HTMLInputElement>) => {
        const query: string = e.currentTarget.value

        query.length === 0 && setSearchedUsers([])

        query.length > 2 && axios.get(`/search?query=${ query }`)
            .then((res) => setSearchedUsers(res.data))
    }

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />
            <div className="flex flex-row gap-0 h-screen">
                <div className="bg-white basis-1/3 relative">
                    <div className="flex items-center">
                        <button className="p-3" ref={ showPrefsBtnRef } onClick={() => {
                            setShowMenu({ ...showMenu, show: true })
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="currentColor" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
                            </svg>
                        </button>
                        <input type="search" onInput={e => searchUsers(e)} placeholder="Search"
                               className="w-3/4 rounded-full my-3 mx-auto block"/>
                    </div>
                    {
                        showMenu.mainSettings && (
                            <div className="absolute flex flex-col w-full h-full z-20 bg-white top-0">
                                <div className="flex items-center w-full text-center font-bold text-2xl p-4">
                                    <button onClick={() => setShowMenu({...showMenu, show: false})}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth="2.2" stroke="grey" className="size-6 mr-10">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                                        </svg>
                                    </button>
                                    Settings
                                </div>
                                <div className="w-full h-80">
                                    <div className="bg-black w-full h-full"></div>
                                </div>
                                <div className="flex fleex-col items-center p-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth="2" stroke="grey" className="size-8 mr-5">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"/>
                                    </svg>
                                    <div>
                                        <p>{ user.name }</p>
                                        <p className="text-gray-500">Username</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        searchedUsers.length > 0 && (
                            <div className="border-2 p-3">
                                {
                                    searchedUsers.map(user => (
                                        <div className="flex items-center p-2" key={ user.id }>
                                            <div className="w-14 h-14 bg-black rounded-full mr-3"></div>
                                            <div>{user.name}</div>
                                        </div>
                                    ))
                                }
                            </div>)
                    }
                    {
                        showMenu.show && (
                            <div className="relative z-10">
                                <div className="absolute bg-white w-4/5" ref={ prefsPanelRef }
                                     style={{ boxShadow: '0 .25rem .5rem .125rem #2563eb52' }}>
                                <button className="p-5 flex" onClick={() => setShowMenu({ ...showMenu, mainSettings: true })}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        Settings
                                    </button>
                                </div>
                            </div>
                        )
                    }
                    {
                        chats && !searchedUsers.length && chats.map((chat: ChatType): ReactNode => (
                            <div className="flex flex-row py-3" key={ chat.id } onClick={() => setActiveChat(chat.id)}>
                                <div className="h-14 w-14 rounded-full bg-black mr-2"></div>
                                <div className="bg-blue-300 grow flex-1 flex flex-col justify-center">
                                    <h3>{chat.users.filter(filteredUser => filteredUser.id !== user.id)[0].name}</h3>
                                    <p>Last message</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className="bg-green-600 basis-2/3 px-3 flex flex-col justify-between">
                    <div className="flex-1 h-full">
                        { messagesElems }
                    </div>
                    <div className="flex w-full">
                        <input value={ messageText } onChange={(e) => setMessageText(e.target.value)} className="flex-1"/>
                        <button className="rounded-full bg-white w-12 flex justify-center items-center" onClick={ sendMessage }>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                                 stroke="blue" className="size-8">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
