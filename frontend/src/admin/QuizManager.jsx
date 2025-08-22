import React, { useState, useEffect } from 'react'
import { adminListSections, adminListQuizQuestions, adminCreateQuizQuestion, adminUpdateQuizQuestion, adminDeleteQuizQuestion, adminGetQuizStats } from '../api.js'

const card = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }
const input = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', fontSize: 14 }
const textarea = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', fontSize: 14, minHeight: 100, resize: 'vertical' }
const select = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', fontSize: 14, background: 'white' }
const button = { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#111827', color: 'white', cursor: 'pointer', fontSize: 14 }
const ghost = { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', color: '#111827', cursor: 'pointer', fontSize: 14 }
const danger = { padding: '8px 16px', border: '1px solid #dc2626', borderRadius: 8, background: 'white', color: '#dc2626', cursor: 'pointer', fontSize: 14 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }
const questionCard = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }
const badge = { fontSize: 12, padding: '4px 8px', borderRadius: 999, border: '1px solid #e5e7eb' }

export default function QuizManager() {
	const [sections, setSections] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedSection, setSelectedSection] = useState('')
	const [selectedTopic, setSelectedTopic] = useState('')
	const [questions, setQuestions] = useState([])
	const [form, setForm] = useState({
		question: '',
		options: ['', '', '', ''],
		correctAnswer: 0,
		explanation: '',
		difficulty: 'medium',
		topic: '',
		section: ''
	})
	const [editingQuestion, setEditingQuestion] = useState(null)

	useEffect(() => {
		loadSections()
	}, [])

	useEffect(() => {
		if (selectedSection && selectedTopic) {
			loadQuestions()
		}
	}, [selectedSection, selectedTopic])

	const loadSections = async () => {
		setLoading(true)
		try {
			const res = await adminListSections()
			setSections(res.sections || [])
		} catch (error) {
			console.error('Failed to load sections:', error)
		} finally {
			setLoading(false)
		}
	}

	const loadQuestions = async () => {
		if (!selectedSection || !selectedTopic) return
		
		setLoading(true)
		try {
			const res = await adminListQuizQuestions(selectedSection, selectedTopic)
			setQuestions(res.questions || [])
		} catch (error) {
			console.error('Failed to load questions:', error)
			setQuestions([])
		} finally {
			setLoading(false)
		}
	}

	const handleSectionChange = (sectionId) => {
		setSelectedSection(sectionId)
		setSelectedTopic('')
		setQuestions([])
	}

	const handleTopicChange = (topic) => {
		setSelectedTopic(topic)
		setQuestions([])
	}

	const handleOptionChange = (index, value) => {
		const newOptions = [...form.options]
		newOptions[index] = value
		setForm({ ...form, options: newOptions })
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!form.question.trim() || !form.topic || !form.section) {
			alert('Please fill in all required fields')
			return
		}

		if (form.options.some(opt => !opt.trim())) {
			alert('Please fill in all options')
			return
		}

		// Validate correctAnswer is a valid number
		if (typeof form.correctAnswer !== 'number' || form.correctAnswer < 0 || form.correctAnswer >= form.options.length) {
			alert('Please select a valid correct answer')
			return
		}

		try {
			console.log('Submitting question data:', form)
			
			// Ensure all required fields are present and properly formatted
			const questionData = {
				question: form.question.trim(),
				options: form.options.map(opt => opt.trim()),
				correctAnswer: parseInt(form.correctAnswer),
				explanation: form.explanation.trim(),
				difficulty: form.difficulty,
				topic: form.topic,
				section: form.section
			}
			
			console.log('Processed question data:', questionData)
			
			if (editingQuestion) {
				// Update existing question
				console.log('Updating question:', editingQuestion.id)
				const response = await adminUpdateQuizQuestion(editingQuestion.id, questionData)
				console.log('Update response:', response)
				setEditingQuestion(null)
			} else {
				// Add new question
				console.log('Creating new question')
				const response = await adminCreateQuizQuestion(questionData)
				console.log('Create response:', response)
			}
			
			// Reset form
			setForm({
				question: '',
				options: ['', '', '', ''],
				correctAnswer: 0,
				explanation: '',
				difficulty: 'medium',
				topic: '',
				section: ''
			})
			
			// Reload questions
			await loadQuestions()
		} catch (error) {
			console.error('Failed to save question:', error)
			console.error('Error details:', {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status
			})
			
			let errorMessage = 'Failed to save question'
			if (error.response?.data?.detail) {
				errorMessage += `: ${error.response.data.detail}`
			} else if (error.message) {
				errorMessage += `: ${error.message}`
			}
			
			alert(errorMessage)
		}
	}

	const editQuestion = (question) => {
		setEditingQuestion(question)
		setForm({
			question: question.question,
			options: [...question.options],
			correctAnswer: question.correctAnswer,
			explanation: question.explanation,
			difficulty: question.difficulty,
			topic: question.topic,
			section: question.section
		})
	}

	const deleteQuestion = async (questionId) => {
		if (!confirm('Are you sure you want to delete this question?')) return
		
		try {
			await adminDeleteQuizQuestion(questionId)
			await loadQuestions()
		} catch (error) {
			console.error('Failed to delete question:', error)
			alert('Failed to delete question')
		}
	}

	const seedSampleQuestions = async () => {
		if (!selectedSection || !selectedTopic) {
			alert('Please select a section and topic first')
			return
		}

		const sampleQuestions = [
			{
				question: "What is the highest common factor (HCF) of 24 and 36?",
				options: ["6", "8", "12", "24"],
				correctAnswer: 2,
				explanation: "The HCF of 24 and 36 is 12. We can find this by listing the factors: 24 (1,2,3,4,6,8,12,24) and 36 (1,2,3,4,6,9,12,18,36). The highest common factor is 12.",
				difficulty: "medium",
				topic: selectedTopic,
				section: selectedSection
			},
			{
				question: "If a number is divisible by both 3 and 4, it must also be divisible by:",
				options: ["6", "8", "12", "24"],
				correctAnswer: 2,
				explanation: "If a number is divisible by both 3 and 4, it must be divisible by their least common multiple (LCM). Since 3 and 4 are coprime, LCM = 3 × 4 = 12.",
				difficulty: "easy",
				topic: selectedTopic,
				section: selectedSection
			},
			{
				question: "What is the smallest prime number?",
				options: ["0", "1", "2", "3"],
				correctAnswer: 2,
				explanation: "2 is the smallest prime number. 0 and 1 are not considered prime numbers by definition.",
				difficulty: "easy",
				topic: selectedTopic,
				section: selectedSection
			}
		]

		try {
			for (const question of sampleQuestions) {
				await adminCreateQuizQuestion(question)
			}
			alert(`Successfully added ${sampleQuestions.length} sample questions!`)
			await loadQuestions()
		} catch (error) {
			console.error('Failed to seed sample questions:', error)
			alert('Failed to add sample questions. Please check the console for details.')
		}
	}

	const getDifficultyColor = (difficulty) => {
		switch (difficulty) {
			case 'easy': return { background: '#dcfce7', color: '#166534', border: '#bbf7d0' }
			case 'medium': return { background: '#fef3c7', color: '#92400e', border: '#fde68a' }
			case 'hard': return { background: '#fee2e2', color: '#991b1b', border: '#fecaca' }
			default: return { background: '#f3f4f6', color: '#374151', border: '#e5e7eb' }
		}
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
				<h3 style={{ margin: 0, color: '#111827' }}>Quiz Question Management</h3>
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={seedSampleQuestions} style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M12 4v16m-8-8h16"/>
						</svg>
						Add Sample Questions
					</button>
					<button onClick={loadSections} style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M1 4v6h6"/>
							<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
						</svg>
						Refresh
					</button>
				</div>
			</div>

			<div style={grid}>
				{/* Question Form */}
				<div style={card}>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>
						{editingQuestion ? 'Edit Question' : 'Add New Question'}
					</h4>
					
					<form onSubmit={handleSubmit}>
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Section *
							</label>
							<select 
								value={form.section} 
								onChange={(e) => setForm({ ...form, section: e.target.value })}
								style={select}
								required
							>
								<option value="">Select Section</option>
								{sections.map(section => (
									<option key={section.id} value={section.id}>
										{section.title}
									</option>
								))}
							</select>
						</div>

						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Topic *
							</label>
							<select 
								value={form.topic} 
								onChange={(e) => setForm({ ...form, topic: e.target.value })}
								style={select}
								required
							>
								<option value="">Select Topic</option>
								{form.section && sections.find(s => s.id === form.section)?.topics?.map(topic => (
									<option key={topic} value={topic}>
										{topic}
									</option>
								))}
							</select>
						</div>

						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Question *
							</label>
							<textarea
								value={form.question}
								onChange={(e) => setForm({ ...form, question: e.target.value })}
								style={textarea}
								placeholder="Enter the question..."
								required
							/>
						</div>

						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
								Options *
							</label>
							{form.options.map((option, index) => (
								<div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
									<input
										type="radio"
										name="correctAnswer"
										checked={form.correctAnswer === index}
										onChange={() => setForm({ ...form, correctAnswer: index })}
										style={{ margin: 0 }}
									/>
									<input
										type="text"
										value={option}
										onChange={(e) => handleOptionChange(index, e.target.value)}
										style={input}
										placeholder={`Option ${index + 1}`}
										required
									/>
								</div>
							))}
						</div>

						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Difficulty
							</label>
							<select
								value={form.difficulty}
								onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
								style={select}
							>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>
						</div>

						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Explanation
							</label>
							<textarea
								value={form.explanation}
								onChange={(e) => setForm({ ...form, explanation: e.target.value })}
								style={textarea}
								placeholder="Explain why this is the correct answer..."
							/>
						</div>

						<div style={{ display: 'flex', gap: 8 }}>
							<button type="submit" style={button}>
								{editingQuestion ? 'Update Question' : 'Add Question'}
							</button>
							{editingQuestion && (
								<button 
									type="button" 
									onClick={() => {
										setEditingQuestion(null)
										setForm({
											question: '',
											options: ['', '', '', ''],
											correctAnswer: 0,
											explanation: '',
											difficulty: 'medium',
											topic: '',
											section: ''
										})
									}} 
									style={ghost}
								>
									Cancel
								</button>
							)}
						</div>
					</form>
				</div>

				{/* Question List */}
				<div style={card}>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Questions</h4>
					
					{/* Filter Controls */}
					<div style={{ marginBottom: 16 }}>
						<select 
							value={selectedSection} 
							onChange={(e) => handleSectionChange(e.target.value)}
							style={select}
						>
							<option value="">All Sections</option>
							{sections.map(section => (
								<option key={section.id} value={section.id}>
									{section.title}
								</option>
							))}
						</select>
					</div>

					{selectedSection && (
						<div style={{ marginBottom: 16 }}>
							<select 
								value={selectedTopic} 
								onChange={(e) => handleTopicChange(e.target.value)}
								style={select}
							>
								<option value="">All Topics</option>
								{sections.find(s => s.id === selectedSection)?.topics?.map(topic => (
									<option key={topic} value={topic}>
										{topic}
									</option>
								))}
							</select>
						</div>
					)}

					{loading ? (
						<div style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</div>
					) : questions.length > 0 ? (
						<div>
							{questions.map(question => (
								<div key={question.id} style={questionCard}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 500, marginBottom: 8 }}>{question.question}</div>
											<div style={{ marginBottom: 8 }}>
												{question.options.map((option, index) => (
													<div key={index} style={{ 
														marginBottom: 4, 
														padding: '4px 8px', 
														background: index === question.correctAnswer ? '#dcfce7' : '#f3f4f6',
														borderRadius: 4,
														border: index === question.correctAnswer ? '1px solid #bbf7d0' : '1px solid #e5e7eb'
													}}>
														{String.fromCharCode(65 + index)}. {option}
														{index === question.correctAnswer && ' ✓'}
													</div>
												))}
											</div>
											{question.explanation && (
												<div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
													{question.explanation}
												</div>
											)}
										</div>
										<div style={{ display: 'flex', gap: 4 }}>
											<span style={{ 
												...badge, 
												...getDifficultyColor(question.difficulty) 
											}}>
												{question.difficulty}
											</span>
										</div>
									</div>
									<div style={{ display: 'flex', gap: 8 }}>
										<button onClick={() => editQuestion(question)} style={ghost}>
											Edit
										</button>
										<button onClick={() => deleteQuestion(question.id)} style={danger}>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>
							{selectedSection && selectedTopic ? 'No questions found for this topic' : 'Select a section and topic to view questions'}
						</div>
					)}
				</div>
			</div>

			{/* Bulk Actions */}
			<div style={card}>
				<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Bulk Actions</h4>
				<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
					<button style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
							<polyline points="7,10 12,15 17,10"/>
							<line x1="12" y1="15" x2="12" y2="3"/>
						</svg>
						Export Questions
					</button>
					<button style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
							<polyline points="17,8 12,3 7,8"/>
							<line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
						Import Questions
					</button>
					<button style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M9 12l2 2 4-4"/>
							<path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
							<path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
							<path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
						</svg>
						Generate Quiz
					</button>
					<button onClick={seedSampleQuestions} style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M12 4v16m-8-8h16"/>
						</svg>
						Seed Sample Questions
					</button>
				</div>
			</div>
		</div>
	)
}
