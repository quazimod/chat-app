
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ReactElement, ReactNode, useEffect, useState} from "react";
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

export default function Messages({ chats, user_id } : { chats: ChatType[], user_id: number }): ReactNode {
    const [activeChat, setActiveChat] = useState(1)
    const [messages, setMessages] = useState<MessageType[]>([])
    const [messageText, setMessageText] = useState<string>("")

    useEffect(() => {
        axios.get(`/messages/${activeChat}`)
            .then((res) => setMessages(res.data) )
    }, [activeChat]);

    const messagesEls: ReactElement[] = messages.map(message => {
        let messageStyle: string = "w-2/3 rounded-lg my-1"
        messageStyle = message.sender_id === user_id ? messageStyle + ' float-right bg-white' : messageStyle + ' float-left bg-green-300'

        return (<div className={ messageStyle }>
            <p className="p-3">{message.message}</p>
        </div>)
    })

    const sendMessage= () => {
        axios.post(`/messages/${activeChat}`, { message: messageText })
            // @ts-ignore
            .then(res => setMessages(prev => [...prev, res.data]))
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Messages
                </h2>
            }
        >
            <Head title="Messages" />
            <div className="flex flex-row gap-0 h-screen">
                <div className="bg-white basis-1/3" >
                    { chats && chats.map((chat : ChatType): ReactNode => (
                        <div className="flex flex-row py-3" key={ chat.id } onClick={ () => setActiveChat(chat.id)}>
                            <div className="h-14 w-14 rounded-full bg-black mr-2"></div>
                            <div className="bg-blue-300 grow flex-1 flex flex-col justify-center">
                                <h3>{ chat.users.filter(user => user.id !== user_id)[0].name }</h3>
                                <p>Last message</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-green-600 basis-2/3 px-3 flex flex-col justify-between">
                        <div className="flex-1 h-full">
                        {messagesEls}
                    </div>
                    <div className="flex w-full">
                        <input value={ messageText } onChange={ (e) => setMessageText(e.target.value) } className="flex-1"/>
                        <button className="rounded-full bg-white w-12 flex justify-center items-center" onClick={sendMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                 stroke="blue" className="size-8">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
