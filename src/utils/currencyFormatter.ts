const { format: currencyFormatter } = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export { currencyFormatter }
