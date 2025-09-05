import Image from 'next/image';

const IchatLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center p-1">
        <Image
          src="/favicon.ico"
          alt="IChat Logo"
          width={28}
          height={28}
          className="object-contain"
        />
      </div>
      <h1 className="text-xl font-bold text-blue-400">
        IChat
      </h1>
    </div>
  );
};

export default IchatLogo;
