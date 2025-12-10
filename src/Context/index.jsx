import { createContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ShoppingCartContext = createContext();

export const ShoppingCartProvider = ({ children }) => {
  // UI state
  const [counter, setCounter] = useState(0);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isCheckoutSideMenu, setIsCheckoutSideMenu] = useState(false);
  const [productDetail, setProductDetail] = useState({
    title: "",
    price: "",
    description: "",
    image: ""
  });
  const [cartProducts, setCartProducts] = useState([]);
  const [order, setOrder] = useState([]);

  // items & search
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  // local storage hook (keeps account in localStorage). We rename signIn->localSignIn so we can wrap it.
  const {
    account,
    signIn: localSignIn,
    signOut: localSignOut,
    isSignIn
  } = useLocalStorage();

  // Auth wrapper: will call backend then call localSignIn to persist account in local storage.
  const signIn = async (data) => {
    // if data includes name -> register, otherwise login
    try {
      let res;
      if (data && data.name) {
        // register
        res = await api.register({ name: data.name, email: data.email, password: data.password });
      } else if (data && data.email) {
        // login
        res = await api.login({ email: data.email, password: data.password });
      } else {
        // signIn without params -> attempt to read existing account from localStorage (original behaviour)
        // call localSignIn() with existing account so template logic still works
        return localSignIn();
      }

      // expected response: { message, user, token }
      if (res && res.token && res.user) {
        // store token separately (localSignIn probably stores the user object)
        try { localStorage.setItem('token', res.token); } catch (e) { /* ignore */ }
        // localSignIn might expect the same shape the template used; we pass the user and password not included.
        localSignIn(res.user); // persist account in template's storage
        return { success: true, user: res.user, token: res.token };
      } else {
        // fallback: if API returned something else, still attempt to call localSignIn
        localSignIn(res?.user || {});
        return { success: true, data: res };
      }
    } catch (err) {
      console.error('Auth error', err?.response?.data || err.message || err);
      // rethrow so SignIn page can react
      throw err;
    }
  };

  const signOut = () => {
    try { localStorage.removeItem('token'); } catch (e) {}
    localSignOut(); // original hook behaviour
  };

  // Basic UI helpers
  const openProductDetail = () => setIsProductDetailOpen(true);
  const closeProductDetail = () => setIsProductDetailOpen(false);
  const openCheckoutSideMenu = () => setIsCheckoutSideMenu(true);
  const closeCheckoutSideMenu = () => setIsCheckoutSideMenu(false);

  // product detail show
  const showProduct = (product) => {
    // ensure product shape: product.image and product.price
    setProductDetail({
      title: product.title,
      price: product.price,
      description: product.description || '',
      image: product.image || product.imageUrl || ''
    });
    openProductDetail();
  };

  // Cart functions (keep original behaviour)
  const addProductToCart = (e, product) => {
    e.stopPropagation();
    // template expects id property on items
    const id = product.id || product._id;
    const find = cartProducts.find(p => (p.id || p._id) === id);
    if (find) return;
    const toAdd = { ...product, id };
    setCartProducts(prev => [...prev, toAdd]);
    setCounter(prev => prev + 1);
  };

  // load items from backend and normalize to the frontend shape
  const fetchItemsFromBackend = useCallback(async () => {
    try {
      // fetch many items (limit sufficiently large or implement paging)
      const data = await api.getItems({ page: 1, limit: 100 });
      // API returns: { page, limit, totalPages, total, items }
      let itemsArray = [];
      if (Array.isArray(data)) {
        // if backend returned plain array
        itemsArray = data;
      } else if (Array.isArray(data.items)) {
        itemsArray = data.items;
      } else if (Array.isArray(data.data)) {
        itemsArray = data.data;
      }

      // normalize shape to match template's expected fields:
      // template expects: id, title, price, description, image, category
      const normalized = itemsArray.map(it => ({
        id: it._id || it.id,
        _id: it._id || it.id,
        title: it.title || it.name || '',
        price: it.price ?? 0,
        description: it.description || '',
        image: it.image || it.imageUrl || '',
        // category: use first tag or empty string - template uses .category for label
        category: (Array.isArray(it.tags) ? it.tags[0] : (it.category || '')) || '',
        raw: it
      }));

      setItems(normalized);
    } catch (err) {
      console.error('Failed to fetch items from backend', err?.response?.data || err.message || err);
    }
  }, []);

  // initial fetch - replace the old fetch(apiUrl) behaviour
  useEffect(() => {
    fetchItemsFromBackend();
  }, [fetchItemsFromBackend]);

  // filtering
  const filteredItemsByTitle = () => {
    const sv = searchValue || '';
    const sc = searchCategory || '';
    let condition = item => (item.title || '').toString().toLowerCase().includes(sv.toLowerCase());
    let categoryCondition = item => (item.category || '').toString().toLowerCase().includes(sc?.toLowerCase());

    return items?.filter(item => searchCategory === "" ? condition(item) : condition(item) && categoryCondition(item));
  };

  useEffect(() => {
    setFilteredItems(filteredItemsByTitle());
  }, [items, searchValue, searchCategory]);

  const updateCategoryPath = categoryPath => {
    const category = categoryPath.substring(1);
    setSearchCategory(category);
  };

  // expose context values
  return (
    <ShoppingCartContext.Provider value={{
      counter,
      setCounter,
      isProductDetailOpen,
      openProductDetail,
      closeProductDetail,
      productDetail,
      setProductDetail,
      cartProducts,
      setCartProducts,
      addProductToCart,
      showProduct,
      isCheckoutSideMenu,
      openCheckoutSideMenu,
      closeCheckoutSideMenu,
      order,
      setOrder,
      items,
      setItems,
      searchValue,
      setSearchValue,
      filteredItems,
      setFilteredItems,
      filteredItemsByTitle,
      searchCategory,
      setSearchCategory,
      updateCategoryPath,
      account,
      signIn,
      signOut,
      isSignIn
    }}>
      {children}
    </ShoppingCartContext.Provider>
  );
};
