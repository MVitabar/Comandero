import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

async function createProductsAndPrices() {
  try {
    console.log('Creating products and prices in Stripe...')

    // Create Basic Plan Product
    const basicProduct = await stripe.products.create({
      name: 'Basic Plan',
      description: 'Basic subscription plan for small restaurants',
      metadata: {
        plan: 'basic',
        maxUsers: '1',
        maxInventoryItems: '50',
      },
    })

    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 1900, // $19.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'basic',
      },
    })

    console.log(`Basic Plan created: Product ID: ${basicProduct.id}, Price ID: ${basicPrice.id}`)

    // Create Professional Plan Product
    const professionalProduct = await stripe.products.create({
      name: 'Professional Plan',
      description: 'Professional subscription plan for growing restaurants',
      metadata: {
        plan: 'professional',
        maxUsers: '5',
        maxInventoryItems: '200',
      },
    })

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 4900, // $49.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'professional',
      },
    })

    console.log(`Professional Plan created: Product ID: ${professionalProduct.id}, Price ID: ${professionalPrice.id}`)

    // Create Enterprise Plan Product
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Plan',
      description: 'Enterprise subscription plan for restaurant chains',
      metadata: {
        plan: 'enterprise',
        maxUsers: 'unlimited',
        maxInventoryItems: 'unlimited',
      },
    })

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 9900, // $99.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'enterprise',
      },
    })

    console.log(`Enterprise Plan created: Product ID: ${enterpriseProduct.id}, Price ID: ${enterprisePrice.id}`)

    console.log('\n=== PRICE IDs TO UPDATE IN YOUR CODE ===')
    console.log(`basic: '${basicPrice.id}'`)
    console.log(`professional: '${professionalPrice.id}'`)
    console.log(`enterprise: '${enterprisePrice.id}'`)
    console.log('=========================================\n')

    return {
      basic: basicPrice.id,
      professional: professionalPrice.id,
      enterprise: enterprisePrice.id,
    }
  } catch (error) {
    console.error('Error creating products and prices:', error)
    throw error
  }
}

// Run the script
createProductsAndPrices()
  .then((priceIds) => {
    console.log('Successfully created all products and prices!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to create products and prices:', error)
    process.exit(1)
  })
