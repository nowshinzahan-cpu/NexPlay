import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PublicLayout({ children, headerVariant = 'default' }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header variant={headerVariant} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
