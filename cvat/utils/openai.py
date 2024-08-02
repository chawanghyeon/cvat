import json

from openai import OpenAI
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS


def load_db(embedding_function, save_path:str, index_name:str):
    db = FAISS.load_local(
        folder_path=save_path, index_name=index_name, embeddings=embedding_function, allow_dangerous_deserialization=True
    )
    return db


def process(request: dict):
    client = OpenAI()
    embeddings = OpenAIEmbeddings()

    query: str = request.GET.get("query")
    history: str = request.GET.get("history")
    history: list = json.loads(history)

    db = load_db(
        embedding_function=embeddings,
        save_path="cvat/utils/faiss/",
        index_name="salmon_guide",
    )

    results: list = db.similarity_search_with_score(query, k = 2)

    contexts: list = []
    for result, score in results:
        if score < 0.4:
            contexts.append(result.metadata["context"])
    context: str = "\n".join(contexts)

    if len(contexts) > 0:
        content: str = f"""
                Question: ```{query}```

                Context: ```{context}```"""
    else:
        content: str = f"""Question: ```{query}```"""


    messages: list = [{"role": "assistant", "content": "모든 질문에 대한 답변은 주어진 Context 와 이전 답변을 기반으로 한글로 해야 합니다."}]
    messages.extend(history)
    messages.append({"role": "user", "content": content})

    print(messages)

    stream = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=messages,
        stream=True,
    )

    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            data: str = chunk.choices[0].delta.content.replace("\n", "<br>")
            yield f"data: {data}\n\n"
