import React, { useState } from 'react';
import { CheckCircle, Upload, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Orientation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [analyseInitiale, setAnalyseInitiale] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [conseilGeneral, setConseilGeneral] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // First Step State
  const [serieBac, setSerieBac] = useState('');
  const [releveNote, setReleveNote] = useState(null);

  // Second Step State
  const [reponses, setReponses] = useState({});

  const seriesBac = ['S', 'C', 'D', 'A1', 'A2', 'L', 'OSE'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image (JPG, PNG, etc.)');
        return;
      }
      
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setError('');
      setReleveNote(file);
      console.log('File selected:', file.name, file.type, file.size);
    }
  };

  const submitInitial = async () => {
    if (!serieBac || !releveNote) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('serie_bac', serieBac);
      formData.append('releve_note', releveNote);

      const token = localStorage.getItem('access');
      
      // Log pour debug
      console.log('Sending data:', {
        serie_bac: serieBac,
        releve_note: releveNote.name,
        token: token ? 'Present' : 'Missing'
      });

      const response = await fetch('http://backend:8000/api/orientation/submit-initial/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Ne pas mettre Content-Type pour FormData, le navigateur le gère automatiquement
        },
        body: formData
      });

      // Lire la réponse même en cas d'erreur pour voir les détails
      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setSessionId(data.session_id);
        setQuestions(data.questions);
        setAnalyseInitiale(data.analyse_initiale);
        setCurrentStep(2);
        
        // Initialize reponses object
        const initialReponses = {};
        data.questions.forEach(q => {
          initialReponses[q.id] = '';
        });
        setReponses(initialReponses);
      } else {
        // Afficher les détails de l'erreur pour mieux comprendre
        const errorMsg = data.error || data.message || 'Une erreur est survenue';
        const errorDetails = data.details ? JSON.stringify(data.details) : '';
        setError(`${errorMsg} ${errorDetails}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur de connexion au serveur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReponses = async () => {
    // Check if all questions are answered
    const allAnswered = Object.values(reponses).every(r => r.trim() !== '');
    if (!allAnswered) {
      setError('Veuillez répondre à toutes les questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reponsesArray = Object.entries(reponses).map(([question_id, reponse]) => ({
        question_id: parseInt(question_id),
        reponse
      }));

      const token = localStorage.getItem('access');
      const response = await fetch('http://backend:8000/api/orientation/submit-reponses/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          reponses: reponsesArray
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFilieres(data.filieres);
        setConseilGeneral(data.conseil_general);
        setCurrentStep(3);
      } else {
        setError(data.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const FirstStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-2" style={{ color: '#1D373F' }}>
        Démarrez votre orientation
      </h2>
      <p className="text-gray-600 mb-8">
        Renseignez vos informations pour commencer l'analyse
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1D373F' }}>
            Série du Baccalauréat
          </label>
          <select
            value={serieBac}
            onChange={(e) => setSerieBac(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4B8FA5] transition-colors"
          >
            <option value="">Sélectionnez votre série</option>
            {seriesBac.map(serie => (
              <option key={serie} value={serie}>{serie}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1D373F' }}>
            Relevé de notes
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4B8FA5] transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-sm text-gray-600">
                {releveNote ? releveNote.name : 'Cliquez pour télécharger votre relevé de notes'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Format: JPG, PNG (Max 10MB)
              </p>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={submitInitial}
          disabled={loading}
          className="w-full py-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#4B8FA5' }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyse en cours...
            </>
          ) : (
            <>
              Continuer
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const SecondStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-2" style={{ color: '#1D373F' }}>
        Questions complémentaires
      </h2>
      <p className="text-gray-600 mb-6">
        Répondez à ces questions pour affiner votre orientation
      </p>

      {analyseInitiale && (
        <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#4B8FA5' }}>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h3 className="text-xl font-bold text-white mb-3 mt-0" {...props} />,
                p: ({node, ...props}) => <p className="text-white text-sm mb-2 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                ul: ({node, ...props}) => <ul className="text-white text-sm list-disc ml-5 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="text-white mb-1" {...props} />
              }}
            >
              {analyseInitiale}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1D373F' }}>
              Question {index + 1}: {q.question}
            </label>
            <textarea
              value={reponses[q.id] || ''}
              onChange={(e) => setReponses({ ...reponses, [q.id]: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4B8FA5] transition-colors"
              placeholder="Votre réponse..."
            />
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 py-4 border-2 font-semibold rounded-lg transition-all hover:bg-gray-50"
            style={{ borderColor: '#4B8FA5', color: '#4B8FA5' }}
          >
            Retour
          </button>
          <button
            onClick={submitReponses}
            disabled={loading}
            className="flex-1 py-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#4B8FA5' }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Traitement...
              </>
            ) : (
              <>
                Obtenir mes résultats
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const LastStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#1D373F' }}>
          Vos filières recommandées
        </h2>
        <p className="text-gray-600">
          Voici les filières qui correspondent le mieux à votre profil
        </p>
      </div>

      {conseilGeneral && (
        <div className="mb-8 p-6 rounded-lg border-2" style={{ borderColor: '#4B8FA5', backgroundColor: '#f0f9ff' }}>
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h3 className="text-2xl font-bold mb-3 mt-0" style={{ color: '#1D373F' }} {...props} />,
                h3: ({node, ...props}) => <h4 className="text-lg font-semibold mb-2 mt-4" style={{ color: '#4B8FA5' }} {...props} />,
                p: ({node, ...props}) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" style={{ color: '#1D373F' }} {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-700" {...props} />
              }}
            >
              {conseilGeneral}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {filieres.map((filiere, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#4B8FA5] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1D373F' }}>
                  {filiere.nom}
                </h3>
                <div className="prose prose-sm max-w-none mb-2">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="text-gray-600 text-sm mb-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />
                    }}
                  >
                    {filiere.description}
                  </ReactMarkdown>
                </div>
                <p className="text-xs text-gray-500 mt-2">📅 Durée: {filiere.duree}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ backgroundColor: '#4B8FA5' }}>
                  {filiere.correspondance}%
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: '#1D373F' }}>
                  <span>💼</span> Débouchés
                </h4>
                <ul className="space-y-2">
                  {filiere.debouches.map((debouche, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-[#4B8FA5] mt-0.5">✓</span>
                      {debouche}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: '#1D373F' }}>
                  <span>⭐</span> Points forts
                </h4>
                <ul className="space-y-2">
                  {filiere.points_forts.map((point, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-[#4B8FA5] mt-0.5">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setCurrentStep(1);
          setSerieBac('');
          setReleveNote(null);
          setReponses({});
          setSessionId(null);
          setFilieres([]);
          setConseilGeneral('');
          setAnalyseInitiale('');
        }}
        className="w-full mt-8 py-4 border-2 font-semibold rounded-lg transition-all hover:bg-gray-50"
        style={{ borderColor: '#4B8FA5', color: '#4B8FA5' }}
      >
        Faire une nouvelle analyse
      </button>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                      currentStep >= step ? 'scale-100' : 'scale-90 opacity-50'
                    }`}
                    style={{ backgroundColor: currentStep >= step ? '#4B8FA5' : '#cbd5e1' }}
                  >
                    {currentStep > step ? <CheckCircle size={24} /> : step}
                  </div>
                  <span className="text-xs mt-2 font-medium" style={{ color: currentStep >= step ? '#1D373F' : '#94a3b8' }}>
                    {step === 1 ? 'Informations' : step === 2 ? 'Questions' : 'Résultats'}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className="flex-1 h-1 mx-4 rounded transition-all"
                    style={{ backgroundColor: currentStep > step ? '#4B8FA5' : '#cbd5e1' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && <FirstStep />}
        {currentStep === 2 && <SecondStep />}
        {currentStep === 3 && <LastStep />}
      </div>
    </div>
  );
};

export default Orientation;

// import React, { useState } from 'react';
// import { CheckCircle, Upload, ArrowRight, Loader2 } from 'lucide-react';

// const Orientation = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [sessionId, setSessionId] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [analyseInitiale, setAnalyseInitiale] = useState('');
//   const [filieres, setFilieres] = useState([]);
//   const [conseilGeneral, setConseilGeneral] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // First Step State
//   const [serieBac, setSerieBac] = useState('');
//   const [releveNote, setReleveNote] = useState(null);

//   // Second Step State
//   const [reponses, setReponses] = useState({});

//   const seriesBac = ['S', 'C', 'D', 'A1','A2', 'L', 'OSE'];

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Vérifier que c'est bien une image
//       if (!file.type.startsWith('image/')) {
//         setError('Le fichier doit être une image (JPG, PNG, etc.)');
//         return;
//       }
      
//       // Vérifier la taille (5MB max)
//       if (file.size > 5 * 1024 * 1024) {
//         setError('L\'image ne doit pas dépasser 5MB');
//         return;
//       }
      
//       setError('');
//       setReleveNote(file);
//       console.log('File selected:', file.name, file.type, file.size);
//     }
//   };

//   const submitInitial = async () => {
//     if (!serieBac || !releveNote) {
//       setError('Veuillez remplir tous les champs');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const formData = new FormData();
//       formData.append('serie_bac', serieBac);
//       formData.append('releve_note', releveNote);

//       const token = localStorage.getItem('access');
      
//       // Log pour debug
//       console.log('Sending data:', {
//         serie_bac: serieBac,
//         releve_note: releveNote.name,
//         token: token ? 'Present' : 'Missing'
//       });

//       const response = await fetch('http://backend:8000/api/orientation/submit-initial/', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//           // Ne pas mettre Content-Type pour FormData, le navigateur le gère automatiquement
//         },
//         body: formData
//       });

//       // Lire la réponse même en cas d'erreur pour voir les détails
//       const data = await response.json();
//       console.log('Response:', data);

//       if (response.ok) {
//         setSessionId(data.session_id);
//         setQuestions(data.questions);
//         setAnalyseInitiale(data.analyse_initiale);
//         setCurrentStep(2);
        
//         // Initialize reponses object
//         const initialReponses = {};
//         data.questions.forEach(q => {
//           initialReponses[q.id] = '';
//         });
//         setReponses(initialReponses);
//       } else {
//         // Afficher les détails de l'erreur pour mieux comprendre
//         const errorMsg = data.error || data.message || 'Une erreur est survenue';
//         const errorDetails = data.details ? JSON.stringify(data.details) : '';
//         setError(`${errorMsg} ${errorDetails}`);
//       }
//     } catch (err) {
//       console.error('Error:', err);
//       setError('Erreur de connexion au serveur: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitReponses = async () => {
//     // Check if all questions are answered
//     const allAnswered = Object.values(reponses).every(r => r.trim() !== '');
//     if (!allAnswered) {
//       setError('Veuillez répondre à toutes les questions');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const reponsesArray = Object.entries(reponses).map(([question_id, reponse]) => ({
//         question_id: parseInt(question_id),
//         reponse
//       }));

//       const token = localStorage.getItem('access');
//       const response = await fetch('http://backend:8000/api/orientation/submit-reponses/', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           session_id: sessionId,
//           reponses: reponsesArray
//         })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setFilieres(data.filieres);
//         setConseilGeneral(data.conseil_general);
//         setCurrentStep(3);
//       } else {
//         setError(data.message || 'Une erreur est survenue');
//       }
//     } catch (err) {
//       setError('Erreur de connexion au serveur');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const FirstStep = () => (
//     <div className="bg-white rounded-lg shadow-lg p-8">
//       <h2 className="text-3xl font-bold mb-2" style={{ color: '#1D373F' }}>
//         Démarrez votre orientation
//       </h2>
//       <p className="text-gray-600 mb-8">
//         Renseignez vos informations pour commencer l'analyse
//       </p>

//       <div className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium mb-2" style={{ color: '#1D373F' }}>
//             Série du Baccalauréat
//           </label>
//           <select
//             value={serieBac}
//             onChange={(e) => setSerieBac(e.target.value)}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4B8FA5] transition-colors"
//           >
//             <option value="">Sélectionnez votre série</option>
//             {seriesBac.map(serie => (
//               <option key={serie} value={serie}>{serie}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2" style={{ color: '#1D373F' }}>
//             Relevé de notes
//           </label>
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4B8FA5] transition-colors cursor-pointer">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               className="hidden"
//               id="file-upload"
//             />
//             <label htmlFor="file-upload" className="cursor-pointer">
//               <Upload className="mx-auto mb-4 text-gray-400" size={48} />
//               <p className="text-sm text-gray-600">
//                 {releveNote ? releveNote.name : 'Cliquez pour télécharger votre relevé de notes'}
//               </p>
//               <p className="text-xs text-gray-400 mt-2">
//                 Format: JPG, PNG (Max 10MB)
//               </p>
//             </label>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//             {error}
//           </div>
//         )}

//         <button
//           onClick={submitInitial}
//           disabled={loading}
//           className="w-full py-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
//           style={{ backgroundColor: '#4B8FA5' }}
//         >
//           {loading ? (
//             <>
//               <Loader2 className="animate-spin" size={20} />
//               Analyse en cours...
//             </>
//           ) : (
//             <>
//               Continuer
//               <ArrowRight size={20} />
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );

//   const SecondStep = () => (
//     <div className="bg-white rounded-lg shadow-lg p-8">
//       <h2 className="text-3xl font-bold mb-2" style={{ color: '#1D373F' }}>
//         Questions complémentaires
//       </h2>
//       <p className="text-gray-600 mb-6">
//         Répondez à ces questions pour affiner votre orientation
//       </p>

//       {analyseInitiale && (
//         <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#4B8FA5' }}>
//           <h3 className="font-semibold text-white mb-2">Analyse initiale</h3>
//           <p className="text-white text-sm">{analyseInitiale}</p>
//         </div>
//       )}

//       <div className="space-y-6">
//         {questions.map((q, index) => (
//           <div key={q.id}>
//             <label className="block text-sm font-medium mb-2" style={{ color: '#1D373F' }}>
//               Question {index + 1}: {q.question}
//             </label>
//             <textarea
//               value={reponses[q.id] || ''}
//               onChange={(e) => setReponses({ ...reponses, [q.id]: e.target.value })}
//               rows={4}
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4B8FA5] transition-colors"
//               placeholder="Votre réponse..."
//             />
//           </div>
//         ))}

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//             {error}
//           </div>
//         )}

//         <div className="flex gap-4">
//           <button
//             onClick={() => setCurrentStep(1)}
//             className="flex-1 py-4 border-2 font-semibold rounded-lg transition-all hover:bg-gray-50"
//             style={{ borderColor: '#4B8FA5', color: '#4B8FA5' }}
//           >
//             Retour
//           </button>
//           <button
//             onClick={submitReponses}
//             disabled={loading}
//             className="flex-1 py-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
//             style={{ backgroundColor: '#4B8FA5' }}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="animate-spin" size={20} />
//                 Traitement...
//               </>
//             ) : (
//               <>
//                 Obtenir mes résultats
//                 <ArrowRight size={20} />
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const LastStep = () => (
//     <div className="bg-white rounded-lg shadow-lg p-8">
//       <div className="text-center mb-8">
//         <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
//         <h2 className="text-3xl font-bold mb-2" style={{ color: '#1D373F' }}>
//           Vos filières recommandées
//         </h2>
//         <p className="text-gray-600">
//           Voici les filières qui correspondent le mieux à votre profil
//         </p>
//       </div>

//       {conseilGeneral && (
//         <div className="mb-8 p-6 rounded-lg border-2" style={{ borderColor: '#4B8FA5', backgroundColor: '#f0f9ff' }}>
//           <h3 className="font-semibold mb-2" style={{ color: '#1D373F' }}>
//             Conseil général
//           </h3>
//           <p className="text-gray-700">{conseilGeneral}</p>
//         </div>
//       )}

//       <div className="space-y-6">
//         {filieres.map((filiere, index) => (
//           <div key={index} className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#4B8FA5] transition-all">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex-1">
//                 <h3 className="text-xl font-bold mb-2" style={{ color: '#1D373F' }}>
//                   {filiere.nom}
//                 </h3>
//                 <p className="text-gray-600 text-sm mb-2">{filiere.description}</p>
//                 <p className="text-xs text-gray-500">Durée: {filiere.duree}</p>
//               </div>
//               <div className="ml-4 flex-shrink-0">
//                 <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#4B8FA5' }}>
//                   {filiere.correspondance}%
//                 </div>
//               </div>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <h4 className="font-semibold text-sm mb-2" style={{ color: '#1D373F' }}>
//                   Débouchés
//                 </h4>
//                 <ul className="space-y-1">
//                   {filiere.debouches.map((debouche, i) => (
//                     <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
//                       <span className="text-[#4B8FA5] mt-1">•</span>
//                       {debouche}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <h4 className="font-semibold text-sm mb-2" style={{ color: '#1D373F' }}>
//                   Points forts
//                 </h4>
//                 <ul className="space-y-1">
//                   {filiere.points_forts.map((point, i) => (
//                     <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
//                       <span className="text-[#4B8FA5] mt-1">•</span>
//                       {point}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <button
//         onClick={() => {
//           setCurrentStep(1);
//           setSerieBac('');
//           setReleveNote(null);
//           setReponses({});
//           setSessionId(null);
//         }}
//         className="w-full mt-8 py-4 border-2 font-semibold rounded-lg transition-all hover:bg-gray-50"
//         style={{ borderColor: '#4B8FA5', color: '#4B8FA5' }}
//       >
//         Faire une nouvelle analyse
//       </button>
//     </div>
//   );

//   return (
//     <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#f8fafc' }}>
//       <div className="max-w-4xl mx-auto">
//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             {[1, 2, 3].map((step) => (
//               <React.Fragment key={step}>
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
//                       currentStep >= step ? 'scale-100' : 'scale-90 opacity-50'
//                     }`}
//                     style={{ backgroundColor: currentStep >= step ? '#4B8FA5' : '#cbd5e1' }}
//                   >
//                     {currentStep > step ? <CheckCircle size={24} /> : step}
//                   </div>
//                   <span className="text-xs mt-2 font-medium" style={{ color: currentStep >= step ? '#1D373F' : '#94a3b8' }}>
//                     {step === 1 ? 'Informations' : step === 2 ? 'Questions' : 'Résultats'}
//                   </span>
//                 </div>
//                 {step < 3 && (
//                   <div
//                     className="flex-1 h-1 mx-4 rounded transition-all"
//                     style={{ backgroundColor: currentStep > step ? '#4B8FA5' : '#cbd5e1' }}
//                   />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>

//         {/* Step Content */}
//         {currentStep === 1 && <FirstStep />}
//         {currentStep === 2 && <SecondStep />}
//         {currentStep === 3 && <LastStep />}
//       </div>
//     </div>
//   );
// };

// export default Orientation;