import Modal from "@/components/generics/modal"
import { useEffect, useState } from "react"

const ConfirmationModal = ({
	showAction,
	onAccept,
	children
}: {
	showAction: boolean,
	onAccept: () => void,
	children?: React.ReactNode
}) => {

	const [show, setShow] = useState<boolean>(false);

	useEffect(() => {
		setShow(prev => !prev)
	}, [showAction]);

	return (
		<Modal isOpen={show} onAccept={onAccept}>
			{children}
		</Modal>
	)
}

export default ConfirmationModal;
