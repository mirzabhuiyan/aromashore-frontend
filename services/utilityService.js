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

export function calculateWeight(cart = []) {
  console.log("Cart", cart);
  let subWeight = (item) => {
    const weight = Number(item.weight) || 0;
    const quantity = Number(item.quantity) || 0;
    return weight * quantity;
  }
  console.log("Cart SubWeight", subWeight);
  const totalWeight = cart.reduce((prev, current) => {
    return prev + subWeight(current);
  }, 0);
  console.log("Cart TotalWeight", totalWeight);
  return totalWeight;
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

/**
 * Calculate Stripe payment fee and adjusted amount
 * Stripe fee: 2.9% + $0.30 (online card and wallet payments)
 * @param {number} originalAmount - The original amount in dollars
 * @returns {object} Object containing fee amount and adjusted amount
 */
export function calculateStripeFee(originalAmount) {
  if (!originalAmount || originalAmount <= 0) {
    return {
      originalAmount: 0,
      feeAmount: 0,
      adjustedAmount: 0
    };
  }

  // Stripe fee: 2.9% + $0.30 (online card and wallet payments)
  const percentageFee = originalAmount * 0.029; // 2.9%
  const fixedFee = 0.30; // $0.30
  const totalFee = percentageFee + fixedFee;
  
  // Calculate the amount needed to cover the fee
  // If we want the customer to pay the fee, we need to add it to the original amount
  const adjustedAmount = originalAmount + totalFee;

  return {
    originalAmount: parseFloat(originalAmount.toFixed(2)),
    feeAmount: parseFloat(totalFee.toFixed(2)),
    adjustedAmount: parseFloat(adjustedAmount.toFixed(2))
  };
}
