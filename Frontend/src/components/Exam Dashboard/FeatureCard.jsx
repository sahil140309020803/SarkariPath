const FeatureCard = ({ icon, title, desc, onClick, className }) => {
  return (
    <div onClick={onClick} className={`group flex flex-col gap-5 p-8 justify-center h-auto min-h-[12rem] rounded-3xl bg-white dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-slate-700 shadow-xl dark:shadow-none cursor-pointer hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 overflow-hidden relative ${className || 'w-full sm:w-[18rem] md:w-[22rem]'}`}>
        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 rounded-bl-full -translate-y-4 translate-x-4 transition-transform group-hover:scale-150'></div>
        
        <div className='size-14 shrink-0 rounded-2xl flex justify-center items-center text-3xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm transition-colors relative z-10'>
            <div className='group-hover:scale-110 transition-transform duration-300'>{icon}</div>
        </div>
        
        <div className='flex flex-col relative z-10 mt-2'>
            <div className='text-xl font-bold text-gray-800 dark:text-white transition-colors tracking-tight'>{title}</div>
            <div className='text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed mt-1.5 transition-colors max-w-[250px]'>{desc}</div>
        </div>      
    </div>
  )
}

export default FeatureCard;