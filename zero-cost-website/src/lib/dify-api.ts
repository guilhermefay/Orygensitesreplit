
interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  message_id: string;
}

export async function sendMessageToDify(message: string, conversationId?: string): Promise<DifyResponse> {
  const endpoint = 'https://api.dify.ai/v1/chat-messages';
  const apiKey = 'app-Gy1fK66tpgk2JP6dAKJXC48S';
  
  const payload = {
    inputs: {},
    query: message,
    response_mode: 'blocking',
    conversation_id: conversationId || null,
    user: 'website-visitor'
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Dify API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      answer: data.answer,
      conversation_id: data.conversation_id,
      message_id: data.id
    };
  } catch (error) {
    console.error('Error communicating with Dify:', error);
    throw error;
  }
}
