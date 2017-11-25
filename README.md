# The Synchrotron

Synchronizes your music library with your music players.

## Usage

```
npm start --
  --library-adapter rhythmbox
  --rhythmbox-config-dir ~/.local/share/rhythmbox/
  --rhythmbox-library-dir ~/Music
  --rhythmbox-playlists Soundtrack Jazz Metal
  --target-adapter filesystem
  --target-dir /tmp/Music
```

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
