import { CheckIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useShoppingCart } from "../../hooks/useShoppingCart";

const Card = ({ data }) => {
  const {
    cartProducts,
    addProductToCart,
    showProduct
  } = useShoppingCart();

  // support both template shape and backend shape
  const id = data.id || data._id;
  const img = data.image || data.imageUrl || (data.raw && data.raw.imageUrl) || '';
  const title = data.title || data.name || '';
  const price = data.price ?? 0;
  const category = data.category || (Array.isArray(data.tags) ? data.tags[0] : '');

  const isInCart = cartProducts.filter(product => (product.id || product._id) === id).length > 0;

  const commonClasses = "absolute top-0 right-0 flex justify-center items-center w-6 h-6 rounded-full m-2 p-1";

  const renderIcon = () => {
    if (isInCart) {
      return (
        <div className={`${commonClasses} bg-black`}>
          <CheckIcon className="h-6 w-6 text-white" />
        </div>
      )
    } else {
      return (
        <div
          className={`${commonClasses} bg-white`}
          onClick={(e) => addProductToCart(e, { ...data, id })}
        >
          <PlusIcon className="h-6 w-6 text-black"/>
        </div>
      )
    }
  }

  return (
    <div 
      className="bg-white cursor-pointer w-56 h-60 rounded-lg"
      onClick={() => showProduct({ ...data, id, image: img, title, price })}
    >
      <figure className="relative mb-2 w-full h-4/5">
        <span className="absolute bottom-0 left-0 bg-white/60 rounded-lg text-black text-xs m-2 px-3 py-0.5">
          {category}
        </span>
        <img
          className="w-full h-full object-cover rounded-lg"
          src={img}
          alt={title}
        />
        {renderIcon()}
      </figure>
      <p className="flex justify-between">
        <span className="text-sm font-light">{title}</span>
        <span className="text-lg font-medium">${price}</span>
      </p>
    </div>
  );
}

export { Card }