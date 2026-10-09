from dotenv import load_dotenv
from openai import OpenAI
from openai.types.chat import ChatCompletionUserMessageParam

load_dotenv(override=True)

client = OpenAI()

messages: list[ChatCompletionUserMessageParam] = [
    {"role": "user", "content": "What is 1 + 1 ?"}
]

response = client.chat.completions.create(model="gpt-5.4-nano", messages=messages)

print(response.choices[0].message.content)
