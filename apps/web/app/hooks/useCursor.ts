import{useEffect , useRef} from "react"

export function useCursor(){
  const cursorRef = useRef<HTMLDIVElement>(null)
  useEffect(()=>{
    const cursor = cursorRef.current
    if(!cursor) return

    const move = (e:MouseEvent)=>{
      cursor.style.left = e.clientX+'px'
      cursor.style.top = e.clientY+'px'
    }
    const expand = ()=> cursor.classList.add('cursor--expanded')
    const shrink = ()=>cursor.classList.remove('cursor--expanded')

    window.addEventListener('mousemove',move);

    document.querySelectorAll('a,button').forEach(el=>{
      el.addEventListener('mouseenter',expand)
      el.addEventListener('mouseleave',shrink)

    })
    return ()=>{
      window.removeEventListener('mousemove',move)
    }
  },[])
  return cursorRef
}