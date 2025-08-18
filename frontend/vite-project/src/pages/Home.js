"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-6">Keep Lebanon Clean Together</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Report waste issues, track progress, and help build a cleaner, healthier Lebanon. Join thousands of citizens
            making a difference in their communities.
          </p>
          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/create-report" className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100">
                Report an Issue
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100">
                Get Started
              </Link>
            )}
            <Link to="/map" className="btn btn-secondary">
              View Map
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-4">Report Issues</h3>
              <p>Snap a photo, tag the location, and describe the waste problem in your area.</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-4">Track Progress</h3>
              <p>View real-time updates on reported issues and see how your community is improving.</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-4">Earn Rewards</h3>
              <p>Gain points, unlock badges, and compete with others to make the biggest impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-lg">Issues Reported</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">892</div>
              <div className="text-lg">Issues Resolved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">3,456</div>
              <div className="text-lg">Active Citizens</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the movement to keep Lebanon clean. Every report matters, every action counts.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Join Lebanon Clean
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
