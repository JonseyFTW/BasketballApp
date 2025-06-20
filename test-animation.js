// Quick test script to verify animation generation
async function testAnimation() {
  try {
    console.log('Testing animation generation...')
    
    // Test Chicago play animation creation
    const response = await fetch('http://localhost:3002/api/plays/chicago/animation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Animation',
        description: 'Testing the Chicago play animation',
        duration: 10000,
        settings: {
          fps: 30,
          autoPlay: false,
          loop: false,
          showTrails: true,
          trailLength: 5,
          highlightActivePlayer: true,
          transitionDuration: 100
        }
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Animation created successfully!')
      console.log('Frames:', result.data?.frames?.length || 0)
      console.log('Keyframes:', result.data?.keyframes?.length || 0)
      
      // Check if there are movement paths
      const firstFrames = result.data?.frames?.slice(0, 5) || []
      firstFrames.forEach((frame, index) => {
        console.log(`Frame ${index} (${frame.timestamp}ms):`)
        frame.players.forEach(player => {
          console.log(`  Player ${player.label}: (${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)})`)
        })
      })
    } else {
      const error = await response.json()
      console.log('❌ Error:', error.error)
    }
  } catch (err) {
    console.log('❌ Network error:', err.message)
  }
}

// Run the test
testAnimation()