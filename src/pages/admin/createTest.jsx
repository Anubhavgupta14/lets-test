import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateTest = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 10,
        totalMarks: 0,
        questions: [],
        isActive: true,
        startDate: new Date(),
        endDate: null,
        negativeMarkingValue: 1,
        instructions: '',
    });

    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [subjects, setSubjects] = useState([]);
    const token = Cookies.get('token');

    useEffect(() => {
        // Fetch available questions when component mounts
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/admin/getAllQuestions', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }

                const data = await response.json();
                setAvailableQuestions(data.data);

                // Extract unique subjects from questions
                const uniqueSubjects = [...new Set(data.data.map(q => q.subject).filter(Boolean))];
                setSubjects(uniqueSubjects);
            } catch (err) {
                setError('Error fetching questions: ' + err.message);
            }
        };

        fetchQuestions();
    }, []);

    // Initialize selectedQuestionIds from formData.questions
    useEffect(() => {
        setSelectedQuestionIds(formData.questions);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleDateChange = (date, field) => {
        setFormData({
            ...formData,
            [field]: date
        });
    };

    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds(prevSelected => {
            if (prevSelected.includes(questionId)) {
                return prevSelected.filter(id => id !== questionId);
            } else {
                return [...prevSelected, questionId];
            }
        });
    };

    const handleSaveQuestions = () => {
        setFormData({
            ...formData,
            questions: selectedQuestionIds
        });
        setIsDialogOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = Cookies.get('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch('/api/admin/createTest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create test');
            }

            setSuccess(true);
            // Reset form after successful submission
            setFormData({
                title: '',
                description: '',
                duration: 10,
                totalMarks: 0,
                questions: [],
                isActive: true,
                startDate: new Date(),
                endDate: null,
                negativeMarkingValue: 1,
                instructions: '',
            });
            setSelectedQuestionIds([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-blue-400">Create New Test</h1>

            {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-4">
                    Test created successfully!
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="title">
                        Title*
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={100}
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Max 100 characters</p>
                </div>

                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="description">
                        Description*
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="duration">
                        Duration (minutes)*
                    </label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                        value={formData.duration}
                        onChange={handleChange}
                        min="10"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="totalMarks">
                        Total Marks*
                    </label>
                    <input
                        type="number"
                        id="totalMarks"
                        name="totalMarks"
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                        value={formData.totalMarks}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2">
                        Questions
                    </label>
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring focus:border-blue-500"
                        >
                            Add Questions
                        </button>
                        <span className="ml-3 text-gray-300">
                            {formData.questions.length} question{formData.questions.length !== 1 ? 's' : ''} selected
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="isActive">
                        Active
                    </label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            className="mr-2 leading-tight accent-blue-500"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        <span className="text-sm text-gray-300">Make this test active</span>
                    </div>
                </div>

                <div className="flex mb-4">
                    <div className="w-1/2 mr-2">
                        <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="startDate">
                            Start Date
                        </label>
                        <DatePicker
                            id="startDate"
                            selected={formData.startDate}
                            onChange={(date) => handleDateChange(date, 'startDate')}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                            dateFormat="yyyy-MM-dd HH:mm"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                        />
                    </div>

                    <div className="w-1/2 ml-2">
                        <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="endDate">
                            End Date
                        </label>
                        <DatePicker
                            id="endDate"
                            selected={formData.endDate}
                            onChange={(date) => handleDateChange(date, 'endDate')}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                            dateFormat="yyyy-MM-dd HH:mm"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            minDate={formData.startDate}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="negativeMarkingValue">
                        Negative Marking Value
                    </label>
                    <input
                        type="number"
                        id="negativeMarkingValue"
                        name="negativeMarkingValue"
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                        value={formData.negativeMarkingValue}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-blue-300 text-sm font-bold mb-2" htmlFor="instructions">
                        Instructions
                    </label>
                    <textarea
                        id="instructions"
                        name="instructions"
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 border-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                        value={formData.instructions}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Test'}
                    </button>
                </div>
            </form>

            {/* Question Selection Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Select Questions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {availableQuestions.map(question => (
                                <div
                                    key={question._id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedQuestionIds.includes(question._id)
                                            ? 'border-blue-500 bg-blue-900/30'
                                            : 'border-gray-700 hover:border-gray-500'
                                        }`}
                                    onClick={() => toggleQuestionSelection(question._id)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-blue-300 truncate">
                                            {question.question || 'Untitled Question'}
                                        </h3>
                                        <span className="bg-blue-800 text-xs font-semibold px-2 py-1 rounded text-blue-200">
                                            {question.subject || 'No Subject'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-400">
                                            Type: {question.questionType || 'Not specified'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-gray-300">
                                {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} selected
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                    onClick={handleSaveQuestions}
                                >
                                    Save Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTest;