export async function exportElementAsImage(element: HTMLElement, filename = 'canvas.png'): Promise<void> {
  try {
    const svgElements = element.querySelectorAll('svg')
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    
    const rect = element.getBoundingClientRect()
    const scale = 2
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    ctx.scale(scale, scale)
    
    ctx.fillStyle = '#f5f0e6'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    const dataUrl = await domToCanvas(element, rect.width, rect.height)
    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
    
    ctx.drawImage(img, 0, 0, rect.width, rect.height)
    
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  } catch (e) {
    console.error('Export failed:', e)
    alert('导出失败，请重试')
  }
}

async function domToCanvas(element: HTMLElement, width: number, height: number): Promise<string> {
  const clone = element.cloneNode(true) as HTMLElement
  
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = width + 'px'
  wrapper.style.height = height + 'px'
  wrapper.appendChild(clone)
  
  document.body.appendChild(wrapper)
  
  try {
    const svgString = await elementToSvg(element, width, height)
    
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    
    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width * 2, height * 2)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = url
    })
  } finally {
    document.body.removeChild(wrapper)
  }
}

function elementToSvg(element: HTMLElement, width: number, height: number): string {
  const html = element.outerHTML
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${html}
    </div>
  </foreignObject>
</svg>`
}

export function downloadJson(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
