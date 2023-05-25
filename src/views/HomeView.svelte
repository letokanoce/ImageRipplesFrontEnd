<script>
  import Header from "../components/Header.svelte";
  import SearchBar from "../components/SearchBar.svelte";
</script>

<style>
  #theme-img {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20%;
    height: auto;
  }
</style>

<div>
  <Header />
  <img id="theme-img" src="./src/assets/theme.jpg" alt="" />
  <SearchBar />
</div>
