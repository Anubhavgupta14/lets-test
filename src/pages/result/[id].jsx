import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

export default function TestResults() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState('physics'); // Default to physics
    const [filteredAnswers, setFilteredAnswers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchResults = async () => {
            if (!id) return;

            try {
                const token = Cookies.get('token');

                if (!token) {
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`/api/test/getResult?testId=${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const resultData = response.data.data;
                setResults(resultData);
                
                // Filter by physics by default
                const physicsAnswers = resultData.answers.filter(answer => 
                    answer.subject && answer.subject.toLowerCase() === 'physics'
                );
                
                setFilteredAnswers(physicsAnswers.length > 0 ? physicsAnswers : resultData.answers);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching test results:', err);
                setError(err.response?.data?.message || 'Failed to fetch test results. Please try again.');
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    useEffect(() => {
        if (!results) return;

        if (selectedSubject === 'all') {
            setFilteredAnswers(results.answers);
        } else {
            // Filter answers by selected subject
            const filtered = results.answers.filter(answer => 
                answer.subject && answer.subject.toLowerCase() === selectedSubject.toLowerCase()
            );
            setFilteredAnswers(filtered);
        }
    }, [selectedSubject, results]);

    const openQuestionDialog = async (answer, questionId, index) => {
        try {
            const token = Cookies.get('token');
            // Fetch question details from the server
            const response = await axios.get(`/api/test/getQuestion?id=${questionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const questionData = response.data.data;
            
            setSelectedQuestion({
                ...questionData,
                userAnswer: answer.selectedOption ? answer.selectedOption : answer.numericalValue,
                isCorrect: answer.isCorrect,
                score: answer.score
            });
            
            setIsDialogOpen(true);
        } catch (err) {
            console.error('Error fetching question details:', err);
            // Fallback if API fails - using available data
            setSelectedQuestion({
                _id: answer.question.$oid,
                text: `Question ${index + 1}`,
                subject: answer.subject || 'Unknown',
                userAnswer: answer.selectedOption ? answer.selectedOption : answer.numericalValue,
                isCorrect: answer.isCorrect,
                score: answer.score
            });
            setIsDialogOpen(true);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="spinner mb-4 w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500">Loading your test results...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-gray-100">
                <div className="text-red-400 text-center mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-center mb-4 text-gray-700">Error</h2>
                <p className="text-gray-500 text-center">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="w-full mt-6 bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-md transition duration-300"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    if (!results) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score, total) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 60) return 'text-blue-500';
        if (percentage >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getSubjectScoreBarWidth = (score, maxPossible) => {
        // Calculate percentage (capped at 100%)
        const percentage = Math.min(100, (score / maxPossible) * 100);
        return `${percentage}%`;
    };

    // Get unique subjects for dropdown
    const subjects = ['all', ...Object.keys(results.subjectScores)];
    console.log(selectedQuestion,"see")
    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <Head>
                <title>Test Results</title>
                <meta name="description" content="View your test results" />
            </Head>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="border-b border-gray-100 bg-blue-50 p-6">
                        <h1 className="text-2xl font-bold text-gray-700">Test Results</h1>
                        <p className="text-gray-500 mt-1">Completed on {formatDate(results.updatedAt)}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-600">Total Score</h3>
                                <p className={`text-3xl font-bold mt-2 ${getScoreColor(results.totalScore, results.attemptedQuestions * 4)}`}>
                                    {results.totalScore}
                                </p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-600">Questions</h3>
                                <div className="flex justify-center mt-2">
                                    <div className="mr-4">
                                        <span className="block text-3xl font-bold text-green-500">{results.correctAnswers}</span>
                                        <span className="text-sm text-gray-500">Correct</span>
                                    </div>
                                    <div>
                                        <span className="block text-3xl font-bold text-red-500">{results.incorrectAnswers}</span>
                                        <span className="text-sm text-gray-500">Incorrect</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-600">Attempted</h3>
                                <p className="text-3xl font-bold mt-2 text-blue-500">
                                    {results.attemptedQuestions} / 75
                                </p>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-700 mb-4">Subject Performance</h2>

                        {Object.entries(results.subjectScores).map(([subject, data]) => (
                            (
                                <div key={subject} className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-600 font-medium capitalize">{subject}</span>
                                        <span className={`font-semibold ${getScoreColor(data.score, data.total * 4)}`}>
                                            Score: {data.score}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 border border-gray-200">
                                        <div
                                            className="bg-blue-400 h-2.5 rounded-full"
                                            style={{ width: getSubjectScoreBarWidth(data.total, 25) }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <div className='flex item-center gap-2'>
                                            <span>{data.correct} correct</span>
                                            <span>{data.incorrect} incorrect</span>
                                        </div>
                                        <span>{data.total} attempted</span>
                                    </div>
                                </div>
                            )
                        ))}

                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-700">Question Breakdown</h2>
                                <div className="relative">
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="block appearance-none text-black bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 pr-8 rounded shadow-sm leading-tight focus:outline-none focus:shadow-outline"
                                    >
                                        {subjects.map((subject) => (
                                            <option key={subject} value={subject}>
                                                {subject === 'all' ? 'All Subjects' : subject.charAt(0).toUpperCase() + subject.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Grid layout for question breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredAnswers.map((answer, index) => (
                                    <div 
                                        key={answer.question} 
                                        className="border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                        onClick={() => openQuestionDialog(answer, answer.question, index)}
                                    >
                                        <div className="bg-blue-50 px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-700">Question {index + 1}</p>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-500 capitalize">{answer.subject || getSubjectForAnswer(answer)}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                    answer.isCorrect 
                                                        ? 'bg-green-50 text-green-600 border border-green-200' 
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                }`}>
                                                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">Score:</span>
                                                    <span className="text-sm font-medium text-gray-700">{answer.score}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-500">Type:</span>
                                                    <span className="text-xs text-gray-700">
                                                        {answer.selectedOption ? 'Multiple Choice' : 'Numerical'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {answer.isMarkedForReview && (
                                                <div className="mt-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
                                                        Marked for Review
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {filteredAnswers.length === 0 && (
                                <div className="text-center py-8 border border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-gray-500">No questions found for the selected subject.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={() => router.push('/')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition duration-300 border border-gray-300"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Details Dialog */}
            <Transition appear show={isDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsDialogOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-[50%] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-700 border-b pb-2"
                                    >
                                        Question Details
                                    </Dialog.Title>
                                    
                                    {selectedQuestion && (
                                        <div className="mt-4">
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Subject:</p>
                                                <p className="font-medium capitalize text-gray-700">{selectedQuestion.subject || "Unknown"}</p>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Question:</p>
                                                <p className="font-medium text-gray-700">{selectedQuestion.question || "Question text not available"}</p>
                                            </div>

                                            <div className="mb-4">
                                                {selectedQuestion.images && selectedQuestion.images.map((img,i)=>(
                                                    <Image src={img} height={600} width={600}/>
                                                ))}
                                            </div>
                                            
                                            {selectedQuestion.options && (
                                                <div className="mb-4">
                                                    {selectedQuestion.options.length!=0 &&
                                                    <p className="text-sm text-gray-500 mb-1">Options:</p>
                                                    }
                                                    <div className="space-y-2 ml-2">
                                                        {selectedQuestion.options.map((option, idx) => (
                                                            <div 
                                                                key={option._id || idx} 
                                                                className={`p-2 rounded ${selectedQuestion.correctOption === option._id 
                                                                    ? 'bg-green-50 border border-green-200' 
                                                                    : selectedQuestion.userAnswer === option._id && !selectedQuestion.isCorrect
                                                                        ? 'bg-red-50 border border-red-200'
                                                                        : 'bg-gray-50 border border-gray-100'}`}
                                                            >
                                                                <p className="text-sm text-gray-700">
                                                                    {String.fromCharCode(65 + idx)}. {option.text || "Option text"}
                                                                    {option.isCorrect && (
                                                                        <span className="ml-2 text-green-500">✓</span>
                                                                    )}
                                                                    {selectedQuestion.userAnswer === option._id && !selectedQuestion.isCorrect && (
                                                                        <span className="ml-2 text-red-500">✗</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {selectedQuestion?.numericalAnswer && 
                                                    <div className='text-sm text-gray-500'>
                                                        <div className='mb-2'>Correct Answer : {selectedQuestion?.numericalAnswer}</div>
                                                        <div>User's Answer : {selectedQuestion?.userAnswer}</div>
                                                    </div>
                                                    }
                                                </div>
                                            )}
                                            
                                            {!selectedQuestion.options && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-500 mb-1">Your Answer (Numerical):</p>
                                                    <p className={`font-medium ${selectedQuestion.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                                        {selectedQuestion.userAnswer || "No answer provided"}
                                                    </p>
                                                    {!selectedQuestion.isCorrect && selectedQuestion.correctAnswer && (
                                                        <p className="text-sm text-green-500 mt-1">
                                                            Correct answer: {selectedQuestion.correctAnswer}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="mt-4 flex justify-between items-center">
                                                <div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        selectedQuestion.isCorrect 
                                                            ? 'bg-green-50 text-green-600 border border-green-200' 
                                                            : 'bg-red-50 text-red-600 border border-red-200'
                                                    }`}>
                                                        {selectedQuestion.isCorrect ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        Score: {selectedQuestion.score}
                                                    </span>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                                                    onClick={() => setIsDialogOpen(false)}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );

    // Helper function to determine subject for an answer if not directly available
    function getSubjectForAnswer(answer) {
        // Logic to determine subject from results.subjectScores
        // This is a fallback method if answer.subject is not available
        for (const [subject, data] of Object.entries(results.subjectScores)) {
            if (data.total > 0) {
                return subject;
            }
        }
        return 'physics'; // Default fallback to physics instead of mathematics
    }
}