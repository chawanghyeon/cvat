import './styles.scss';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Affix, Button, Modal, Input, Space, PageHeader, Empty, List } from 'antd';
import { RobotOutlined, LoadingOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';

interface Message {
    role: string
    content: string
}

interface DataType {
    id: number
    lastQuery: string
    message: Message[]
}

const loadMessagesFromLocalStorage = () => {
    const messagesString = localStorage.getItem('messages');
    if (messagesString) {
      const messages = JSON.parse(messagesString);
      return messages;
    }
    return [];
};

function FloatButtonComponent(): JSX.Element {
    const [messages, setMessages] = useState<DataType[]>(loadMessagesFromLocalStorage());
    const [toggle, setToggle] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [chatInput, setChatInput] = useState<string>("");
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [showMessage, setShowMessage] = useState(true);
    const [visible, setVisible] = useState<boolean>(true);
    const [currentId, setCurrentId] = useState<number>(0);

    useEffect(() => {
        const messagesString = JSON.stringify(messages);
        localStorage.setItem('messages', messagesString);
    }, [messages]);

    const getBotResponse = async (query: string) => {
        try {

            const currentMessages = messages.find((item) => item.id === currentId)?.message;
            const eventSource = new EventSource(`/api/lambda/openai/?query=${query}&history=${JSON.stringify(currentMessages || [])}`);

            setLoading(true);
            setMessages((prevMessages) => prevMessages.map((item) =>
                item.id === currentId
                  ? {
                      ...item,
                      message: [
                        ...item.message,
                        { role: "assistant", content: "" },
                      ],
                    }
                  : item
              ));
            setMessages(prevMessages => prevMessages.map(item => {
                if (item.id === currentId) {
                    return { ...item, lastQuery: query };
                }
                return item;
            }));

            setEventSource(eventSource);

            eventSource.onmessage = (event) => setAssistantResponse(event);
            eventSource.onerror = () => {
                eventSource.close();
                setLoading(false);
            }
        }
        catch (error) {
            if (eventSource) eventSource.close()
            console.log(error);
            setLoading(false);
        }
    };

    const setAssistantResponse = (event: any) => {
        setMessages((prevMessages) => prevMessages.map((item) => {
            if (item.id === currentId) {
              let lastMessage = item.message[item.message.length - 1];
              const modifiedData = event.data.replace(/<br>/g, "\n");
              let combinedContent = lastMessage.content + modifiedData;

              return {
                ...item,
                message: [
                  ...item.message.slice(0, -1),
                  { role: "assistant", "content": combinedContent },
                ],
              };
            }
            return item;
          }));
    };

    return (
        <>
             <Modal
                open={toggle}
                onCancel={() => setToggle(false)}
                title={
                    <PageHeader
                        onBack={() => setVisible(true)}
                        title={<span className='cvat-text-color'>SALMON Q&A</span>}
                    />
                }
                width={1000}
                centered
                footer={null}
                bodyStyle={{height: 700, maxHeight: 700}}
            >
                <>
                    <div className='cvat-text-color'>
                    {visible ? (
                        <>
                        {messages.length > 0 ? (
                            <>
                                <List
                                    className="cvat-message-list"
                                    itemLayout="horizontal"
                                    dataSource={messages}
                                    loading={false}
                                    renderItem={item => (
                                        <List.Item actions={[
                                            <Button onClick={() => {
                                                setMessages(prevMessages => prevMessages.filter(items => items.id !== item.id));
                                            }}>삭제</Button>]} >
                                            <a className='cvat-text-color' onClick={() => {setCurrentId(item.id); setVisible(false);}}>{item.lastQuery}</a>
                                        </List.Item>
                                    )}
                                />
                                <div className='cvat-create-message'>
                                    <Button onClick={() => {
                                            setVisible(false);
                                            const highestId = messages.length > 0 ? Math.max(...messages.map(item => item.id)) : 0;
                                            setCurrentId(highestId + 1);
                                            setMessages(prevMessages => [
                                                ...prevMessages,
                                                {
                                                  "id": highestId + 1,
                                                  "lastQuery": "방문해주셔서 감사합니다 :) 어떻게 도와드릴까요?",
                                                  "message": [
                                                    {
                                                      "role": "assistant",
                                                      "content": "방문해주셔서 감사합니다 :) 어떻게 도와드릴까요?"
                                                    }
                                                  ]
                                                }
                                              ]);
                                        }
                                    } >새 문의하기</Button>
                                </div>
                            </>
                            ) :
                            (
                                <>
                                    <Empty className='cvat-empty-modal' description="대화를 시작해보세요" />
                                    <div className='cvat-create-message'>
                                        <Button onClick={() => {
                                            setVisible(false);
                                            const highestId = messages.length > 0 ? Math.max(...messages.map(item => item.id)) : 0;
                                            setCurrentId(highestId + 1);
                                            setMessages(prevMessages => [
                                                ...prevMessages,
                                                {
                                                  "id": highestId + 1,
                                                  "lastQuery": "방문해주셔서 감사합니다 :) 어떻게 도와드릴까요?",
                                                  "message": [
                                                    {
                                                      "role": "assistant",
                                                      "content": "방문해주셔서 감사합니다 :) 어떻게 도와드릴까요?"
                                                    }
                                                  ]
                                                }
                                              ]
                                            );
                                        }
                                    } >새 문의하기</Button>
                                    </div>
                                </>
                            )}
                        </>
                        ) : (
                            <>
                                <div className='cvat-message-list'>
                                {
                                    messages.filter(message => message.id === currentId)
                                            .flatMap(message => message.message)
                                            .map((messageDetail, index, filteredMessages) =>
                                                messageDetail.role === "assistant" ? (
                                                    <div key={index}>
                                                        {(loading && index === filteredMessages.length - 1) ? <LoadingOutlined /> : <RobotOutlined />}
                                                        <ReactMarkdown>{messageDetail.content}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <div key={index}>
                                                        <UserOutlined />
                                                        <ReactMarkdown>{messageDetail.content}</ReactMarkdown>
                                                    </div>
                                                ),
                                            )
                                }

                                </div>
                                <Space.Compact block>
                                    <Input.TextArea
                                        placeholder="메시지를 입력해주세요"
                                        allowClear
                                        onChange={(e: any) => setChatInput(e.target.value)}
                                        value={chatInput}
                                        className='cvat-height'
                                        onPressEnter={
                                            async () =>
                                                {
                                                    setMessages((prevMessages) => prevMessages.map((item) => {
                                                        if (item.id === currentId) {
                                                          return {
                                                            ...item,
                                                            message: [
                                                              ...item.message,
                                                              { role: "user", "content": chatInput },
                                                            ],
                                                          };
                                                        }
                                                        return item;
                                                      }));

                                                    await getBotResponse(chatInput);
                                                    setChatInput("");
                                                }
                                        }
                                    />
                                    {loading ?
                                        <Button className='cvat-height'
                                        onClick={
                                            () => {
                                                if (eventSource) {
                                                    eventSource.close();
                                                    setLoading(false);
                                                }
                                            }
                                        }>Stop</Button>
                                        :
                                        <Button
                                            className='cvat-height'
                                            onClick={
                                                async () =>
                                                    {
                                                        setMessages((prevMessages) => prevMessages.map((item) => {
                                                            if (item.id === currentId) {
                                                              return {
                                                                ...item,
                                                                message: [
                                                                  ...item.message,
                                                                  { role: "user", "content": chatInput },
                                                                ],
                                                              };
                                                            }
                                                            return item;
                                                          }));

                                                        await getBotResponse(chatInput);
                                                        setChatInput("");
                                                    }
                                            }>Send</Button>
                                    }
                                </Space.Compact>
                            </>
                        )}
                    </div>
                </>
            </Modal>
            {showMessage && (
                <Affix className='cvat-affix-notice'>
                    <div className='cvat-affix-notice-button'>
                        <div>
                            <strong>궁금한 건 채팅으로 문의하세요
                            <Button shape="circle" icon={<CloseOutlined />} size='small' onClick={() => setShowMessage(false)} /></strong>
                            <div className='cvat-affix-notice-button-text'>빠르게 답변 받으실 수 있어요</div>
                        </div>
                    </div>
                </Affix>
            )}
            <Affix className='cvat-affix-icon'>
                <button
                    className='cvat-affix-icon-button'
                    onClick={() => setToggle(!toggle)}
                    >
                </button>
            </Affix>
        </>
      );
}

export default React.memo(FloatButtonComponent);
