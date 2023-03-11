function Simulation(world,telemetry,randomizer,journalistRandomizer) {

    let clock=new Clock();
    clock.setRandomizer(randomizer,journalistRandomizer);

    world.setClock(clock);
    world.setRandomizer(randomizer,journalistRandomizer);
    world.setTelemetry(telemetry);
    
    this.getTime=()=>{
        return clock.get();
    }

    this.pass=()=>{
        
        world.pass();

        // Pass time
        clock.pass();

    }

}
