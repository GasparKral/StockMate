import Modal from "@/components/generics/modal"
import type { Category } from "@/types/categories";


const CreateCategoryModal = ({
	showModal,
	closeModal,
	category,
}: {
	showModal: boolean,
	closeModal: () => void,
	category?: undefined | null | Category
}) => {
	return (
		<Modal title="Nueva Categoria" isOpen={showModal} onClose={closeModal}>
			<form onSubmit={e => e.preventDefault()} className="flex flex-col w-160 gap-4">
				<label className="form-label max-w-2/5">
					Nombre de la Categoria
					<input className="input" type="text" value={category?.name ?? ""} />
				</label>
				<label className="form-label">
					Descripción
					<textarea className="textarea" value={category?.description ?? ""} />
				</label>
			</form>
		</Modal>
	)
}

export default CreateCategoryModal;
