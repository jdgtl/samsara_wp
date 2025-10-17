<?php

$videoURL = get_field( 'video_embed' );

echo do_shortcode('[video src="' . $videoURL . '" /]');