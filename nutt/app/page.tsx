import { Experience } from '@/components/Experience';
import { Footer } from '@/components/sections/Footer';
import { FinalSection } from '@/components/sections/FinalSection';
import { ProductsSection } from '@/components/sections/ProductsSection';
import {
  CrunchSection,
  IngredientsSection,
  IntroSection,
  ManifestoSection,
  TransformationSection,
  UniverseSection,
  WhySection,
} from '@/components/sections/StorySections';
import { WhereToBuy } from '@/components/sections/WhereToBuy';
import { Header } from '@/components/ui/Header';
import { JsonLd, organizationLd, productListLd } from './structured-data';

export default function Home() {
  return (
    <Experience>
      <JsonLd data={organizationLd} />
      <JsonLd data={productListLd} />
      <Header />
      <main id="conteudo">
        <IntroSection />
        <UniverseSection />
        <IngredientsSection />
        <TransformationSection />
        <CrunchSection />
        <ManifestoSection />
        <ProductsSection />
        <WhySection />
        <FinalSection />
        <WhereToBuy />
      </main>
      <Footer />
    </Experience>
  );
}
