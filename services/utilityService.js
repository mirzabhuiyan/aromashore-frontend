export function calculateCart(cart = []) {
  // let subQty = (items) => {
  //   return items.reduce((prev, item) => {
  //     return prev + item.qty;
  //   }, 0);
  // };

  // const totalQty = cart.reduce((prev, current) => {
  //   return prev + subQty(current.unit);
  // }, 0);

  const totalQty = cart.length;

  let subAmount = (unit) => {
    // return units.reduce((initVal, nextitem) => {
    // if (unit.sale_price > 0) {
    //   return unit.sale_price * unit.qty;
    // }else{
    return unit.price * unit.quantity;
    // }
  };

  const totalAmount = cart.reduce((prev, current) => {
    return prev + subAmount(current);
  }, 0);

  return { totalQty, totalAmount };

}

export function getFormatedDate(date) {
  let formatedDate = null;
  if (date !== '' && date !== null) {
    const y = new Date(date).getFullYear();
    const tM = Number(new Date(date).getMonth()) + 1;
    const m = tM < 10 ? `0${tM}` : tM;
    const tD = new Date(date).getDate();
    const d = tD < 10 ? `0${tD}` : tD;
    formatedDate = `${y}-${m}-${d}`;
  }
  return formatedDate;
};

export function getFormatedTime(date) {
  let formatedTime = null;
  if (date !== '' && date !== null) {
    const tH = new Date(date).getHours();
    const h = tH > 12 ? tH - 12 : (tH === 0 ? 12 : (tH < 10 ? `0${tH}` : tH));
    const aMpM = tH > 12 ? 'PM' : 'AM';
    const tM = new Date(date).getMinutes();
    const m = tM < 10 ? `0${tM}` : tM;
    formatedTime = `${h}:${m} ${aMpM}`;
  }
  return formatedTime;
};
