// These contents can be copy-pasted below the existing code, don't replace the entire file!!

// Utility function to implement a sleep function in TypeScript
function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Setup function
async function setup() {
    // Fake perform some really heavy setup task
    console.log('Performing really heavy frontend setup task...')
    await sleep(3);
    console.log('Frontend setup task complete!')
    // Set the frontend task as being completed
    invoke('set_complete', {task: 'frontend'})
}

// Effectively a JavaScript main function
window.addEventListener("DOMContentLoaded", () => {
    setup()
});
function invoke(arg0: string, arg1: { task: string; }) {
    console.log(`Task ${arg1.task} has been marked as complete by ${arg0}.`);
}
