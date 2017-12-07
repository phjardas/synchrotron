# The Synchrotron

Synchronizes your music library with music players.

Synchrotron was built to be extensible with plugins. There's no limit to the supported music library systems or to the supported target devices.

It should theoretically run on any platform that supports node.js, but its primary target environment are Linux based systems.

## Install

Install Synchrotron with `npm`:

```
npm install -g synchrotron
```

Next you need to install plugins to enable library and target adapters. For example:

```
npm install -g synchrotron-filesystem-plugin
npm install -g synchrotron-rhythmbox-plugin
```

## Usage

Simply run `synchrotron` to get a list of available options. Each plugin brings its own set of configuration options.

To synchronize your Rhythmbox library located at `~/.local/share/rhythmbox` with all songs from the playlists "Soundtrack", "Jazz" and "Metal" to the folder `/media/USB-Stick/Music`, execute the following command:
```
synchrotron
  --library-adapter rhythmbox
  --rhythmbox-config-dir ~/.local/share/rhythmbox/
  --rhythmbox-library-dir ~/Music
  --rhythmbox-playlists Soundtrack Jazz Metal
  --target-adapter filesystem
  --target-dir /media/USB-Stick/Music
```

## Plugins

The following plugins are available:

* File system: `npm install -g synchrotron-filesystem-plugin`
* Rhythmbox: `npm install -g synchrotron-rhythmbox-plugin`

More plugin are coming soon! Please contribute.

## Copying files to MTP devices

It's a bit awkward. You need to first install `jmtpfs`.

```
sudo apt install jmtpfs
```

Then mount your phone to a temporary directory and synchronize to this directory.

```
dir=$(mktemp -d)
jmtpfs $dir

synchrotron \
  ... \
  --target-adapter filesystem \
  --target-dir $dir

fusermount -u $dir
rm -r $dir
```

## Author

Synchrotron was written in Frankfurt (Germany) by [Philipp Jardas](https://github.com/phjardas).
