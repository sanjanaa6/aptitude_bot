// Simple curriculum generator from a topic string
// Produces modules with submodules and estimated times

export function generateCurriculumFromTopic(topic) {
  const clean = String(topic || '').trim()
  const base = clean || 'Your Topic'
  const modules = [
    { title: `Introduction to ${base}`, desc: `Understand the basics of ${base}, its purpose and core concepts.`, level: 'Beginner' },
    { title: `Working with ${base}`, desc: `Create, configure and manage core workflows/tasks.`, level: 'Intermediate' },
    { title: `${base} Components and Integrations`, desc: `Explore components and how to integrate with external services.`, level: 'Intermediate' },
    { title: `Advanced Techniques`, desc: `Optimization, best practices and advanced patterns.`, level: 'Advanced' }
  ]

  const makeSub = (m, i) => [
    { title: `${m} Overview`, minutes: 10 },
    { title: `Key Concepts`, minutes: 10 },
    { title: `Hands-on Exercise`, minutes: 10 },
    { title: `Quiz & Review`, minutes: 10 }
  ].map((s, j) => ({ id: `${i+1}.${j+1}`, ...s }))

  return modules.map((m, i) => ({
    id: `${i+1}`,
    title: m.title,
    description: m.desc,
    level: m.level,
    estimatedMinutes: 40,
    submodules: makeSub(m.title, i)
  }))
}


// Attempt to generate a curriculum using the AI explain endpoint.
// Returns the same shape as generateCurriculumFromTopic.
export async function generateCurriculumFromTopicAI(topic) {
  const { explainTopic } = await import('../../api.js')
  const base = String(topic || '').trim() || 'Your Topic'
  const instruction = [
    `Create a compact learning syllabus for "${base}" as STRICT JSON only.`,
    'Respond with an object: { "modules": [ {',
    '  "id": "1", "title": string, "description": string, "level": "Beginner|Intermediate|Advanced",',
    '  "estimatedMinutes": number,',
    '  "submodules": [ { "id": "1.1", "title": string, "minutes": number } ... ]',
    '} ... ] }',
    'Use 3-5 modules, each with 3-5 submodules of ~10 minutes.',
    'Do NOT include markdown, backticks, or any prose — JSON ONLY.'
  ].join(' ')

  try {
    const res = await explainTopic(instruction)
    let text = String(res?.content ?? '')
    // Extract JSON if model wrapped in code fences
    const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/)
    if (fenceMatch) text = fenceMatch[1]
    // Remove stray non-JSON chars
    text = text.trim()
    const parsed = JSON.parse(text)
    const modules = Array.isArray(parsed?.modules) ? parsed.modules : []
    if (!modules.length) throw new Error('empty')
    // Normalize fields and ids
    const normalized = modules.map((m, i) => ({
      id: String(m.id ?? i + 1),
      title: String(m.title ?? `Module ${i + 1}`),
      description: String(m.description ?? ''),
      level: String(m.level ?? 'Beginner'),
      estimatedMinutes: Number(m.estimatedMinutes ?? 40),
      submodules: (Array.isArray(m.submodules) ? m.submodules : []).map((s, j) => ({
        id: String(s.id ?? `${i + 1}.${j + 1}`),
        title: String(s.title ?? `Topic ${j + 1}`),
        minutes: Number(s.minutes ?? 10),
      }))
    }))
    return normalized
  } catch (err) {
    // Fallback to deterministic generator
    return generateCurriculumFromTopic(base)
  }
}


