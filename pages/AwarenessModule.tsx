import React, { useState, useMemo } from 'react';
import { AwarenessPost, User, AwarenessCategory, Quiz } from '../types';
import { generateAwarenessPost } from '../services/geminiService';
import { BookOpen, Sparkles, Plus, Trash2, Send, ChevronRight, Loader2, Calendar, Eye, ShieldAlert, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { marked } from 'marked';

interface AwarenessModuleProps {
  posts: AwarenessPost[];
  currentUser: User;
  onNavigate: (view: string) => void;
  onAddPost: (post: Omit<AwarenessPost, 'id' | 'tenantId' | 'date' | 'viewCount'>) => void;
  onDeletePost: (id: string) => void;
}

const QuizComponent: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedOption === quiz.correctAnswerIndex;

  return (
    <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-bold text-indigo-900">Desafio de Conhecimento</h3>
      </div>
      
      <p className="font-medium text-gray-800 mb-4">{quiz.question}</p>
      
      <div className="space-y-2">
        {quiz.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !submitted && setSelectedOption(idx)}
            disabled={submitted}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              submitted
                ? idx === quiz.correctAnswerIndex
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : idx === selectedOption
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-white border-gray-200 opacity-50'
                : selectedOption === idx
                  ? 'bg-indigo-100 border-indigo-300 ring-1 ring-indigo-300'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {submitted && idx === quiz.correctAnswerIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
              {submitted && idx === selectedOption && idx !== quiz.correctAnswerIndex && <XCircle className="w-5 h-5 text-red-600" />}
            </div>
          </button>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selectedOption === null}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Verificar Resposta
        </button>
      ) : (
        <div className={`mt-4 p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'} mb-1`}>
            {isCorrect ? 'Correto! 🎉' : 'Incorreto'}
          </p>
          <p className="text-gray-700 text-sm">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
};

export const AwarenessModule: React.FC<AwarenessModuleProps> = ({ posts, currentUser, onNavigate, onAddPost, onDeletePost }) => {
  const [selectedPost, setSelectedPost] = useState<AwarenessPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AwarenessCategory | 'Todos'>('Todos');
  const [isCreating, setIsCreating] = useState(false);
  
  // Creation State
  const [topic, setTopic] = useState('');
  const [createCategory, setCreateCategory] = useState<AwarenessCategory>(AwarenessCategory.SECURITY);
  const [generatedData, setGeneratedData] = useState<{ title: string; content: string; quiz: any } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Todos') return posts;
    return posts.filter(p => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const data = await generateAwarenessPost(topic, createCategory);
    setGeneratedData(data);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    if (!generatedData) return;
    
    onAddPost({
      title: generatedData.title,
      content: generatedData.content,
      category: createCategory,
      isPublished: true,
      quiz: generatedData.quiz
    });
    
    setTopic('');
    setGeneratedData(null);
    setIsCreating(false);
  };

  const handleSelectPost = (post: AwarenessPost) => {
    setSelectedPost(post);
    setIsCreating(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar List */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Conteúdos</span>
            </div>
            <button 
              onClick={() => { setIsCreating(true); setSelectedPost(null); setGeneratedData(null); setTopic(''); }}
              className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              title="Nova Campanha"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Category Filter */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Todos">Todas as Categorias</option>
            {Object.values(AwarenessCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredPosts.map(post => (
            <div 
              key={post.id}
              onClick={() => handleSelectPost(post)}
              className={`p-3 rounded-lg cursor-pointer transition-all border group relative ${
                selectedPost?.id === post.id 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">{post.category}</div>
              <h3 className={`text-sm font-medium line-clamp-2 pr-6 ${selectedPost?.id === post.id ? 'text-emerald-900' : 'text-gray-700'}`}>
                {post.title}
              </h3>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                {post.quiz && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">QUIZ</span>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeletePost(post.id); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {filteredPosts.length === 0 && (
            <div className="text-center p-8 text-gray-400 text-sm">
              Nenhum conteúdo encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">
        {/* Incident Shortcut (Floating or Fixed) */}
        {!isCreating && (
           <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={() => onNavigate('incidents')}
                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full text-xs font-bold border border-red-200 shadow-sm transition-colors"
                >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Reportar Incidente
                </button>
           </div>
        )}

        {isCreating ? (
          <div className="flex flex-col h-full p-6 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Criar Nova Campanha de Conscientização
              </h2>
              <p className="text-sm text-gray-500">Crie conteúdo educativo e quizzes para fortalecer a cultura de dados.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
               <div className="w-full md:w-1/3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Categoria de Foco</label>
                    <select 
                        value={createCategory}
                        onChange={(e) => setCreateCategory(e.target.value as AwarenessCategory)}
                        className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                        {Object.values(AwarenessCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
               </div>
               <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tópico do Treinamento</label>
                    <input 
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Como identificar um e-mail de Phishing..."
                        className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
               </div>
            </div>
            
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors font-medium mb-4"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Gerar Conteúdo + Quiz
            </button>

            {generatedData && (
              <div className="flex-1 flex flex-col gap-4 min-h-0 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Pré-visualização</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Rascunho</span>
                </div>
                
                <div className="flex-1 p-6 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{generatedData.title}</h1>
                    <div className="prose prose-sm prose-emerald max-w-none mb-6">
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(generatedData.content) as string }} />
                    </div>
                    {generatedData.quiz && (
                        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                             <span className="text-xs font-bold text-indigo-600 uppercase mb-2 block">Quiz Gerado</span>
                             <p className="font-medium text-gray-800">{generatedData.quiz.question}</p>
                             <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                                {generatedData.quiz.options.map((opt: string, i: number) => (
                                    <li key={i} className={i === generatedData.quiz.correctAnswerIndex ? "text-green-600 font-medium" : ""}>
                                        {opt} {i === generatedData.quiz.correctAnswerIndex && "(Correta)"}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handlePublish}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Send className="w-4 h-4" /> Publicar
                    </button>
                </div>
              </div>
            )}
          </div>
        ) : selectedPost ? (
          <div className="flex flex-col h-full overflow-hidden">
             {/* Post Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {selectedPost.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {selectedPost.viewCount} visualizações
                    </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{selectedPost.title}</h1>
                <p className="text-sm text-gray-500">Publicado em: {new Date(selectedPost.date).toLocaleDateString()}</p>
            </div>
            
            {/* Post Body */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div 
                    className="prose prose-emerald max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: marked.parse(selectedPost.content) as string }}
                />
                
                {selectedPost.quiz && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <QuizComponent quiz={selectedPost.quiz} />
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="bg-gray-50 p-6 rounded-full">
              <BookOpen className="w-16 h-16 text-gray-300" />
            </div>
            <div className="text-center max-w-md px-4">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Centro de Conhecimento LGPD</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Selecione um tópico à esquerda para iniciar seu treinamento ou crie uma nova campanha educativa para sua organização.
                </p>
            </div>
            <button 
                onClick={() => setIsCreating(true)}
                className="mt-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition-all"
            >
                Criar Nova Campanha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};