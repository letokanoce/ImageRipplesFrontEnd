<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import HomeView from "./views/HomeView.svelte";
  import ImageDisplay from "./views/ImageDisplay.svelte";
  import Collage from "./views/Collage.svelte";
</script>

<Router>
  <Route path="/">
    <HomeView />
  </Route>
  <Route path="images">
    <ImageDisplay />
  </Route>
  <Route path="collage">
    <Collage />
  </Route>
</Router>
