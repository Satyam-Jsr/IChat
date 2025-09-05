import { useEffect, useRef, useState } from "react";

interface ComponentVisibleHook<T extends HTMLElement | null> {
    ref: React.RefObject<T>;
    isComponentVisible: boolean;
    setIsComponentVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useComponentVisible<T extends HTMLElement>(initalIsVisible: boolean): ComponentVisibleHook<T | null> {
    const [isComponentVisible, setIsComponentVisible]= useState(initalIsVisible);
    const ref= useRef<T>(null);

    const handleClickOutside =(event: MouseEvent) => {
        if(ref.current && !ref.current.contains(event.target as Node))
        {
            setIsComponentVisible(false);
        }
    };
useEffect(()=> {
    document.addEventListener("click",handleClickOutside,true);
    return ()=>{
        document.removeEventListener("click",handleClickOutside,true);
    };
},[]);
return {ref,isComponentVisible,setIsComponentVisible};
}