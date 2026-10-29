# Widget Import Guide

This guide explains how to use the [Discord-Widgets-Extension](https://github.com/TheCreativeGod/Discord-Widgets-Extension) by TheCreativeGod to import the [`widget-config.json`](./widget-config.json) file, which automatically creates the widget, sets up the layout, and adds each field.

## Import Steps

1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications) and select your application.
2. Click the **Widget Creator** button in the bottom-right corner of the page.
3. Open the [`widget-config.json`](./widget-config.json) file located in this directory and copy its entire contents.
4. Paste the copied JSON content into the text area under the **SHARE / UPDATE** section inside the extension panel.
5. In the dropdown menu (next to the **Load** button), select the target Discord application you want to update (or leave it as `+ Create new widget` if you are setting it up for a new application).
6. Click the **Import** button.

Once clicked, the extension will automatically import and configure the widget layout and fields.
