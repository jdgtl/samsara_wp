<?php
$taxonomy = 'mb_category';
$terms = get_terms($taxonomy);
?>

<div class="categories">

    <h3>Member Categories:</h3>

    <ul>

    <?php
        foreach ($terms as $term) {

            echo '<li class="btn">' . '<a href="' . esc_attr(get_term_link($term, $taxonomy)) . '" title="' . sprintf( __( "View all posts in %s" ), $term->name ) . '" ' . '>' . $term->name.'</a></li>';

        }
    ?>

    </ul>

    <!--<div class="input-group mb-3">

      <div class="input-group-prepend">

        <label class="input-group-text" for="blogCategories">Categories:</label>

      </div>

      <select class="custom-select" id="blogCategories" onchange="javascript:handleSelect(this)">

          <option selected>Choose a category...</option>

        <?php foreach ($terms as $term) { ?>

          <option value="<?php echo esc_attr( get_term_link($term, $taxonomy) ); ?>" ><?php echo $term->name; ?></option>

        <?php } ?>

      </select>

    </div>

</div>


<script type="text/javascript">
    function handleSelect(elm) {
        window.location = elm.value+"";
    }
</script>-->

</div>