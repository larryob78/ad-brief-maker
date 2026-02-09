const API_BASE = '/api';
const WS_BASE = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

export async function generateTurntable(description) {
  const res = await fetch(`${API_BASE}/character/generate-turntable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  return res.json();
}

export async function getTurntableStatus(jobId) {
  const res = await fetch(`${API_BASE}/character/turntable/${jobId}`);
  return res.json();
}

export async function lockCharacter(jobId) {
  const res = await fetch(`${API_BASE}/character/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId }),
  });
  return res.json();
}

export async function generateWorld(worldType) {
  const res = await fetch(`${API_BASE}/world/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ world_type: worldType }),
  });
  return res.json();
}

export async function analyzeBrief(message, characterDescription, worldType, styleType, conversationHistory) {
  const res = await fetch(`${API_BASE}/brief/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      character_description: characterDescription,
      world_type: worldType,
      style_type: styleType,
      conversation_history: conversationHistory,
    }),
  });
  return res.json();
}

export async function produce(data) {
  const res = await fetch(`${API_BASE}/produce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export function connectPipelineWS(jobId, onMessage) {
  const ws = new WebSocket(`${WS_BASE}/ws/pipeline`);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', job_id: jobId }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  return ws;
}
