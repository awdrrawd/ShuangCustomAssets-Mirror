import { messages } from "./messages.js";
export const TUTORIAL_PAGES = [
    {
        title: { cn: messages.CN["tutorial.what_is_custom_texture"], en: messages.EN["tutorial.what_is_custom_texture"] },
        lines: [
            { cn: messages.CN["tutorial.overlay_custom_images_on_your_character"], en: messages.EN["tutorial.overlay_custom_images_on_your_character"] },
            {},
            { cn: messages.CN["tutorial.core_features"], en: messages.EN["tutorial.core_features"] },
            { cn: messages.CN["tutorial.up_to_18_layers_with_independent_settings"], en: messages.EN["tutorial.up_to_18_layers_with_independent_settings"] },
            { cn: messages.CN["tutorial.animated_gif_playback"], en: messages.EN["tutorial.animated_gif_playback"] },
            { cn: messages.CN["tutorial.per_pose_texture_switching"], en: messages.EN["tutorial.per_pose_texture_switching"] },
            { cn: messages.CN["tutorial.hide_body_parts_clothing"], en: messages.EN["tutorial.hide_body_parts_clothing"] },
            { cn: messages.CN["tutorial.domain_whitelist_security"], en: messages.EN["tutorial.domain_whitelist_security"] },
            {},
            { cn: messages.CN["tutorial.click_next_to_continue"], en: messages.EN["tutorial.click_next_to_continue"], color: "Gray" },
        ]
    },
    {
        title: { cn: messages.CN["tutorial.layers_global_settings"], en: messages.EN["tutorial.layers_global_settings"] },
        lines: [
            { cn: messages.CN["tutorial.each_layer_has_global_settings_as_defaults"], en: messages.EN["tutorial.each_layer_has_global_settings_as_defaults"] },
            {},
            { cn: messages.CN["tutorial.texture_url_the_image_url"], en: messages.EN["tutorial.texture_url_the_image_url"] },
            { cn: messages.CN["tutorial.x_y_offset_image_position"], en: messages.EN["tutorial.x_y_offset_image_position"] },
            { cn: messages.CN["tutorial.scale_x_y_horizontal_vertical_scale"], en: messages.EN["tutorial.scale_x_y_horizontal_vertical_scale"] },
            { cn: messages.CN["tutorial.rotation_360_to_360_degrees"], en: messages.EN["tutorial.rotation_360_to_360_degrees"] },
            { cn: messages.CN["tutorial.opacity_0_100"], en: messages.EN["tutorial.opacity_0_100"] },
            { cn: messages.CN["tutorial.mirror_flip_h_v"], en: messages.EN["tutorial.mirror_flip_h_v"] },
            {},
            { cn: messages.CN["tutorial.without_per_pose_settings_just_adjust_globals"], en: messages.EN["tutorial.without_per_pose_settings_just_adjust_globals"], color: "Gray" },
        ]
    },
    {
        title: { cn: messages.CN["tutorial.per_pose_settings"], en: messages.EN["tutorial.per_pose_settings"] },
        lines: [
            { cn: messages.CN["tutorial.set_different_params_for_specific_poses"], en: messages.EN["tutorial.set_different_params_for_specific_poses"] },
            {},
            { cn: messages.CN["tutorial.two_toggles_at_the_bottom"], en: messages.EN["tutorial.two_toggles_at_the_bottom"] },
            { cn: messages.CN["tutorial.view_toggle"], en: messages.EN["tutorial.view_toggle"] },
            { cn: messages.CN["tutorial.global_edit_global_no_pose_change"], en: messages.EN["tutorial.global_edit_global_no_pose_change"] },
            { cn: messages.CN["tutorial.current_edit_preview_current_pose"], en: messages.EN["tutorial.current_edit_preview_current_pose"] },
            { cn: messages.CN["tutorial.active_toggle"], en: messages.EN["tutorial.active_toggle"] },
            { cn: messages.CN["tutorial.on_use_pose_specific_config"], en: messages.EN["tutorial.on_use_pose_specific_config"] },
            { cn: messages.CN["tutorial.off_fall_back_to_global_config"], en: messages.EN["tutorial.off_fall_back_to_global_config"] },
        ]
    },
    {
        title: { cn: messages.CN["tutorial.batch_configuration"], en: messages.EN["tutorial.batch_configuration"] },
        lines: [
            { cn: messages.CN["tutorial.batch_config_for_multiple_poses"], en: messages.EN["tutorial.batch_config_for_multiple_poses"] },
            {},
            { cn: messages.CN["tutorial.1_click_batch_config_to_select_poses"], en: messages.EN["tutorial.1_click_batch_config_to_select_poses"] },
            { cn: messages.CN["tutorial.2_multi_select_orange_selected"], en: messages.EN["tutorial.2_multi_select_orange_selected"] },
            { cn: messages.CN["tutorial.3_click_edit_selected_to_batch_edit"], en: messages.EN["tutorial.3_click_edit_selected_to_batch_edit"] },
            { cn: messages.CN["tutorial.4_adjust_params_all_combos_sync"], en: messages.EN["tutorial.4_adjust_params_all_combos_sync"] },
            { cn: messages.CN["tutorial.5_save_to_apply_to_all_selected"], en: messages.EN["tutorial.5_save_to_apply_to_all_selected"] },
            {},
            { cn: messages.CN["tutorial.useful_same_image_across_poses_etc"], en: messages.EN["tutorial.useful_same_image_across_poses_etc"], color: "Gray" },
        ]
    },
    {
        title: { cn: messages.CN["listView.hide_settings"], en: messages.EN["listView.hide_settings"] },
        lines: [
            { cn: messages.CN["tutorial.hide_parts_that_occlude_your_textures"], en: messages.EN["tutorial.hide_parts_that_occlude_your_textures"] },
            {},
            { cn: messages.CN["tutorial.8_categories"], en: messages.EN["tutorial.8_categories"] },
            { cn: messages.CN["tutorial.emoticon_chat_emotes"], en: messages.EN["tutorial.emoticon_chat_emotes"] },
            { cn: messages.CN["tutorial.cosplay_hair_wings_animal_body"], en: messages.EN["tutorial.cosplay_hair_wings_animal_body"] },
            { cn: messages.CN["tutorial.face_eyes_eyebrows_mouth"], en: messages.EN["tutorial.face_eyes_eyebrows_mouth"] },
            { cn: messages.CN["tutorial.head_body_upper_body_lower"], en: messages.EN["tutorial.head_body_upper_body_lower"] },
            { cn: messages.CN["tutorial.clothing_clothes_shoes_etc"], en: messages.EN["tutorial.clothing_clothes_shoes_etc"] },
            { cn: messages.CN["tutorial.restraints_all_restraint_items"], en: messages.EN["tutorial.restraints_all_restraint_items"] },
            {},
            { cn: messages.CN["tutorial.click_the_hide_icon_on_the_list_page"], en: messages.EN["tutorial.click_the_hide_icon_on_the_list_page"], color: "Gray" },
        ]
    },
    {
        title: { cn: messages.CN["tutorial.security_whitelist"], en: messages.EN["tutorial.security_whitelist"] },
        lines: [
            { cn: messages.CN["tutorial.whitelist_mode_only_trusted_domains_load"], en: messages.EN["tutorial.whitelist_mode_only_trusted_domains_load"] },
            {},
            { cn: messages.CN["tutorial.ways_to_add_trusted_domains"], en: messages.EN["tutorial.ways_to_add_trusted_domains"] },
            { cn: messages.CN["tutorial.click_trust_in_the_edit_panel"], en: messages.EN["tutorial.click_trust_in_the_edit_panel"] },
            { cn: messages.CN["tutorial.add_manually_in_whitelist_page"], en: messages.EN["tutorial.add_manually_in_whitelist_page"] },
            { cn: messages.CN["tutorial.scan_room_for_all_untrusted"], en: messages.EN["tutorial.scan_room_for_all_untrusted"] },
            { cn: messages.CN["tutorial.untrusted_domain_warning"], en: messages.EN["tutorial.untrusted_domain_warning"] },
            { cn: messages.CN["tutorial.on_show_warning_image"], en: messages.EN["tutorial.on_show_warning_image"] },
            { cn: messages.CN["tutorial.off_skip_silently"], en: messages.EN["tutorial.off_skip_silently"] },
            { cn: messages.CN["tutorial.adjust_in_extension_settings"], en: messages.EN["tutorial.adjust_in_extension_settings"], color: "Gray" },
        ]
    },
    {
        title: { cn: messages.CN["tutorial.import_export"], en: messages.EN["tutorial.import_export"] },
        lines: [
            { cn: messages.CN["tutorial.three_buttons_at_the_bottom"], en: messages.EN["tutorial.three_buttons_at_the_bottom"] },
            {},
            { cn: messages.CN["tutorial.export_copy_configs_to_clipboard"], en: messages.EN["tutorial.export_copy_configs_to_clipboard"] },
            { cn: messages.CN["tutorial.import_replace_replace_all"], en: messages.EN["tutorial.import_replace_replace_all"] },
            { cn: messages.CN["tutorial.import_append_add_after_current"], en: messages.EN["tutorial.import_append_add_after_current"] },
            { cn: messages.CN["tutorial.config_includes_all_params_url_offset"], en: messages.EN["tutorial.config_includes_all_params_url_offset"] },
            { cn: messages.CN["tutorial.scale_rotation_opacity_mirror_etc"], en: messages.EN["tutorial.scale_rotation_opacity_mirror_etc"] },
            { cn: messages.CN["tutorial.replace_includes_hide_settings_and_priorities"], en: messages.EN["tutorial.replace_includes_hide_settings_and_priorities"] },
            {},
            { cn: messages.CN["tutorial.append_checks_the_18_layer_limit"], en: messages.EN["tutorial.append_checks_the_18_layer_limit"], color: "Gray" },
        ]
    },
];
