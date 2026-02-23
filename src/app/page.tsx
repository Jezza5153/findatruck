import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

const FAQ_ITEMS = [
  { q: 'How do I find food trucks near me in Adelaide?', a: 'Open Food Truck Next 2 Me and allow location access. Our live map will show you all nearby food trucks in Adelaide and across South Australia, with real-time status updates so you know which ones are serving right now.' },
  { q: 'How do I list my food truck on Food Truck Next 2 Me?', a: 'Click "Register Your Truck" to create a free owner account. You can add your truck name, cuisine, photos, menu, and social media links. Once set up, you can go live and start attracting customers across Adelaide and South Australia.' },
  { q: 'Is Food Truck Next 2 Me free?', a: 'Yes! Basic listings are completely free for food truck owners. Customers can browse, search, and discover trucks at no cost. Premium plans are available for owners who want extra visibility and features.' },
  { q: 'What areas does Food Truck Next 2 Me cover?', a: 'We focus on Adelaide and the wider South Australia region, including the Adelaide Hills, Barossa Valley, Fleurieu Peninsula, McLaren Vale, and regional SA. Any food truck operating in South Australia can list with us.' },
];

export const metadata: Metadata = {
  title: 'Food Truck Next 2 Me — Find Food Trucks in Adelaide & South Australia',
  description: 'Find the best food trucks near you in Adelaide and South Australia. Live locations, menus, reviews, and real-time tracking. Your next favourite meal on wheels is just a tap away!',
  alternates: {
    canonical: 'https://foodtrucknext2me.com',
    languages: { 'en-AU': 'https://foodtrucknext2me.com' },
  },
};

export default function HomePage() {
  return (
    <>
      <HomeContent />

      {/* FAQ structured data for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />

      {/* Server-rendered SEO content — indexable by Google */}
      <section className="bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-16 border-t border-orange-100">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
            Adelaide&apos;s Food Truck Finder
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
            <p>
              <strong>Food Truck Next 2 Me</strong> is Adelaide and South Australia&apos;s go-to platform
              for discovering food trucks near you. Whether you&apos;re craving tacos in the CBD, gelato in
              Glenelg, or wood-fired pizza in the Adelaide Hills, our real-time food truck map shows you
              exactly where your next meal on wheels is.
            </p>
            <p>
              We help food truck lovers across South Australia find open trucks, browse full menus,
              read reviews, and check in to earn loyalty rewards. From Port Adelaide to McLaren Vale,
              Norwood to Henley Beach — if there&apos;s a food truck rolling, we&apos;ll help you find it.
            </p>

            <h3 className="text-xl font-bold text-slate-700 mt-8">
              For Food Truck Owners in South Australia
            </h3>
            <p>
              Own a food truck in Adelaide? List your truck on Food Truck Next 2 Me for free and reach
              thousands of hungry customers. Our owner dashboard lets you update your location in real-time,
              manage your menu, track reviews, and grow your following. Whether you&apos;re at the Royal Adelaide
              Show, Fork on the Road, or serving lunch at a local winery — we put your truck on the map.
            </p>

            <h3 className="text-xl font-bold text-slate-700 mt-8">
              Frequently Asked Questions
            </h3>
            <details className="border border-orange-200 rounded-xl p-4 bg-white">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                How do I find food trucks near me in Adelaide?
              </summary>
              <p className="mt-2 text-sm">
                Open Food Truck Next 2 Me and allow location access. Our live map will show you all nearby
                food trucks in Adelaide and across South Australia, with real-time status updates so you
                know which ones are serving right now.
              </p>
            </details>
            <details className="border border-orange-200 rounded-xl p-4 bg-white">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                How do I list my food truck on Food Truck Next 2 Me?
              </summary>
              <p className="mt-2 text-sm">
                Click &quot;Register Your Truck&quot; to create a free owner account. You can add your truck name,
                cuisine, photos, menu, and social media links. Once set up, you can go live and start
                attracting customers across Adelaide and South Australia.
              </p>
            </details>
            <details className="border border-orange-200 rounded-xl p-4 bg-white">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                Is Food Truck Next 2 Me free?
              </summary>
              <p className="mt-2 text-sm">
                Yes! Basic listings are completely free for food truck owners. Customers can browse,
                search, and discover trucks at no cost. Premium plans are available for owners who want
                extra visibility and features.
              </p>
            </details>
            <details className="border border-orange-200 rounded-xl p-4 bg-white">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                What areas does Food Truck Next 2 Me cover?
              </summary>
              <p className="mt-2 text-sm">
                We focus on Adelaide and the wider South Australia region, including the Adelaide Hills,
                Barossa Valley, Fleurieu Peninsula, McLaren Vale, and regional SA. Any food truck
                operating in South Australia can list with us.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
