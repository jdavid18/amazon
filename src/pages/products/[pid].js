import { useRouter } from 'next/router';
import Header from '../../components/Header';
import ProductDetail from '../../components/ProductDetail';
import { FaArrowLeft } from "react-icons/fa";

export async function getServerSideProps(context) {
  const { pid } = context.query;
  const product = await fetch(
    `https://fakestoreapi.com/products/${pid}`
  ).then((res) => res.json());

  return {
    props: {
      product,
    },
  };
}

function ProductPage({ product }) {
  const router = useRouter();

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto py-6">
        <button className="mt-auto button" onClick={() => router.back()}>
        <FaArrowLeft />
        <h4 className="absolute top-2 left-2 font-bold text-lg">
          {product.category}
        </h4>
          </button>
        <ProductDetail product={product} />
      </div>
    </div>
  );
}

export default ProductPage;
