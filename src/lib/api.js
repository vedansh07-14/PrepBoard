export const generatePlan = async (examDate, topics) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentDateTime = now.toISOString();

  const res = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ examDate, topics, startDate: today, currentDateTime })
  });

  const text = await res.text();

  if (!text) {
    throw new Error("Empty response from server");
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON:", text);
    throw err;
  }
};
