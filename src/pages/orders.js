import { motion } from "framer-motion";
import moment from "moment";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";

import Header from "../components/Header/Header";
import Order from "../components/Order";
import db from "../../firebase";
import Footer from "../components/footer/Footer"

const Orders = ({ orders }) => {
  const { data: session } = useSession();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <Head>
        <title>Amazon Clone</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="https://pngimg.com/uploads/amazon/amazon_PNG5.png"
        />
      </Head>
      <Header />
      <main className="max-w-screen-lg mx-auto p-10">
        <h1 className="text-3xl border-b mb-2 pb-1 border-yellow-400">
          Your orders
        </h1>
        {session ? (
          <h2>{orders.length} {orders.length === 1 ? "Order" : "Orders"}</h2>
        ) : (
          <h2>Please sign in to see your orders</h2>
        )}

        <div className="mt-5 space-y-4">
          {orders?.map((order) => (
            <Order
              key={order.id}
              id={order.id}
              amount={order.amount}
              amountShipping={order.amountShipping}
              images={order.images}
              timeStamp={order.timestamp}
              items={order.items}
            />
          ))}
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Orders;

export async function getServerSideProps(context) {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const session = await getSession(context);

  if (!session) {
    return {
      props: {},
    };
  }

  const stripeOrders = await db
    .collection("users")
    .doc(session.user.email)
    .collection("orders")
    .orderBy("timeStamp", "desc")
    .get();

  const orders = await Promise.all(
    stripeOrders.docs.map(async (order) => ({
      id: order.id,
      amount: order.data().amount,
      amountShipping: order.data().amount_shipping,
      images: order.data().images,
      timestamp: moment(order.data().timeStamp.toDate()).unix(),
      items: (
        await stripe.checkout.sessions.listLineItems(order.id, {
          limit: 100,
        })
      ).data,
    }))
  );
  return {
    props: {
      orders: orders,
    },
  };
}
