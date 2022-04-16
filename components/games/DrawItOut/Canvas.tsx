import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import styles from '../../../styles/games/DrawItOut/Canvas.module.css'
import { debounce, throttle } from '../../../utils/general'
import { useSockets } from '../../../utils/Socket.util'

interface ComponentArgs {
	canDraw: boolean
}

export default function Canvas({ canDraw }: ComponentArgs) {
	const socket = useSockets()

	const lineWidths = [1, 3, 5]
	const bgColor = '#dadada'
	const colors = ['black', 'white', 'gray', 'orange', 'red', 'limegreen', 'blue', 'darkblue', bgColor]
	const [selectedWidth, setSelectedWidth] = useState(0)
	const [selectedColor, setSelectedColor] = useState(0)
	const [inputColor, setInputColor] = useState('white')
	const [painting, setPainting] = useState(false)
	const [{ prevX, prevY }, setPrevMouseXY] = useState<{ prevX: number; prevY: number }>({ prevX: -1, prevY: -1 })

	const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))

	function clear() {
		const ctx = canvasRef.current!.getContext('2d')!
		ctx.fillStyle = bgColor
		ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
	}

	function drawContent(px: number, py: number, x: number, y: number, c: string, lw: number, sw: number, sh: number) {
		const ow = canvasRef.current!.width
		const oh = canvasRef.current!.height

		const rw = ow / sw
		const rh = oh / sh

		const ctx = canvasRef.current!.getContext('2d')!
		ctx.strokeStyle = c
		ctx.fillStyle = c

		ctx.lineWidth = lw * 2

		if (px >= 0 && py >= 0) {
			ctx.beginPath()
			ctx.moveTo(px * rw, py * rh)
			ctx.lineTo(x * rw, y * rh)
			ctx.stroke()
			ctx.closePath()
		}

		ctx.beginPath()
		ctx.arc(x * rw, y * rh, lw, 0, 2 * Math.PI)
		ctx.fill()
		ctx.closePath()
	}

	function draw(e: any) {
		if (!painting) return

		const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left
		const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top

		const color = selectedColor == colors.length ? inputColor : colors[selectedColor]

		const sw = parseFloat(window.getComputedStyle(canvasRef.current!).width)
		const sh = parseFloat(window.getComputedStyle(canvasRef.current!).height)

		drawContent(prevX, prevY, mouseX, mouseY, color, lineWidths[selectedWidth], sw, sh)

		setPrevMouseXY({ prevX: mouseX, prevY: mouseY })

		socket.emitEvent(
			'Game-DrawItOut-drawSignal',
			prevX,
			prevY,
			mouseX,
			mouseY,
			color,
			lineWidths[selectedWidth],
			sw,
			sh
		)
	}

	useEffect(() => {
		canvasRef.current!.width = parseFloat(window.getComputedStyle(canvasRef.current!).width)
		canvasRef.current!.height = parseFloat(window.getComputedStyle(canvasRef.current!).height)

		clear()

		const listeners = [
			socket.onEvent('Game-DrawItOut-clearAction', clear),
			socket.onEvent('Game-DrawItOut-drawAction', drawContent)
		]

		return () => {
			listeners.forEach((listener) => listener.off())
		}
	}, [])

	return (
		<>
			<canvas
				ref={canvasRef}
				className={styles.canvas}
				onMouseDown={() => {
					canDraw && setPainting(true)
				}}
				onMouseUp={() => {
					setPainting(false)
					setPrevMouseXY({ prevX: -1, prevY: -1 })
				}}
				onMouseMove={draw}
			/>
			{canDraw && (
				<div className={styles.tools}>
					<div className={styles.notColors}>
						<div className={styles.widthArea}>
							{lineWidths.map((width, index) => {
								const style = {
									background: colors[selectedColor],
									width: `${10 + 5 * index}px`,
									height: `${10 + 5 * index}px`,
									outline: 'none'
								}
								if (index == selectedWidth) style.outline = '3px solid white'
								return (
									<button
										className={styles.width}
										style={style}
										key={index}
										onClick={() => {
											setSelectedWidth(index)
										}}
									/>
								)
							})}
						</div>

						<div className={styles.extraTools}>
							<button
								className={styles.clear}
								onClick={() => {
									clear()
									socket.emitEvent('Game-DrawItOut-clearSignal')
								}}>
								&#10006;
							</button>
							<button
								className={
									styles.color + (colors.length - 1 == selectedColor ? ` ${styles.selected}` : '')
								}
								style={{ background: colors[colors.length - 1] }}
								onClick={() => setSelectedColor(colors.length - 1)}
							/>
							<div
								className={
									styles.colorInput + (colors.length == selectedColor ? ` ${styles.selected}` : '')
								}>
								<input
									type='color'
									value={inputColor}
									onChange={(e) => {
										setInputColor(e.currentTarget.value)
										setSelectedColor(colors.length)
									}}
									onClick={() => setSelectedColor(colors.length)}
								/>
							</div>
						</div>
					</div>
					<div className={styles.colorArea}>
						{colors.map((clr, index) => {
							if (index == colors.length - 1) return <></>
							return (
								<button
									className={styles.color + (index == selectedColor ? ` ${styles.selected}` : '')}
									style={{ background: clr }}
									key={index}
									onClick={() => setSelectedColor(index)}
								/>
							)
						})}
					</div>
				</div>
			)}
		</>
	)
}
