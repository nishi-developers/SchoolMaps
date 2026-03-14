# リポジトリのファイルサイズ削減

2025/10/29

## 概要

SchoolMapsリポジトリのサイズが大きくなりすぎているため、`Affinity Designer`のプロジェクトファイル（`.afdesign`）をGit管理から除外し、リポジトリのサイズを削減した。

## 対応前

```shell
$ git count-objects -vH

count: 2705
size: 1.49 GiB
in-pack: 2386
packs: 2
size-pack: 163.59 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

```shell
$ git-sizer -v

Processing blobs: 1659
Processing trees: 2687
Processing commits: 695
Matching commits to trees: 695
Processing annotated tags: 1
Processing references: 15

| Name                         | Value     | Level of concern               |
| ---------------------------- | --------- | ------------------------------ |
| Overall repository size      |           |                                |
| * Commits                    |           |                                |
|   * Count                    |   695     |                                |
|   * Total size               |   260 KiB |                                |
| * Trees                      |           |                                |
|   * Count                    |  2.69 k   |                                |
|   * Total size               |   747 KiB |                                |
|   * Total tree entries       |  20.5 k   |                                |
| * Blobs                      |           |                                |
|   * Count                    |  1.66 k   |                                |
|   * Total size               |  1.81 GiB |                                |
| * Annotated tags             |           |                                |
|   * Count                    |     1     |                                |
| * References                 |           |                                |
|   * Count                    |    15     |                                |
|     * Branches               |     3     |                                |
|     * Tags                   |     9     |                                |
|     * Remote-tracking refs   |     3     |                                |
|                              |           |                                |
| Biggest objects              |           |                                |
| * Commits                    |           |                                |
|   * Maximum size         [1] |  2.87 KiB |                                |
|   * Maximum parents      [2] |     2     |                                |
| * Trees                      |           |                                |
|   * Maximum entries      [3] |    57     |                                |
| * Blobs                      |           |                                |
|   * Maximum size         [4] |  55.9 MiB | *****                          |
|                              |           |                                |
| History structure            |           |                                |
| * Maximum history depth      |   661     |                                |
| * Maximum tag depth      [5] |     1     |                                |
|                              |           |                                |
| Biggest checkouts            |           |                                |
| * Number of directories  [6] |    46     |                                |
| * Maximum path depth     [7] |     5     |                                |
| * Maximum path length    [8] |    64 B   |                                |
| * Number of files        [9] |   341     |                                |
| * Total size of files   [10] |   267 MiB |                                |
| * Number of symlinks         |     0     |                                |
| * Number of submodules       |     0     |                                |

[1]  916b080268c9516dc5c451f900a1cbe32a486d99
[2]  85c752ae166ed75050a1739e1e6609253c750f4a (refs/heads/main)
[3]  c45f06898a68af579916a87e4a0ce38dce830e58 (12848fd430a3aac0e41f3378c8ac25b31e53865c:frontend/public/img/places)
[4]  aef65bd439011ae0ebfd6b02e4c03fadecf635b9 (b803b3207a0a925bea8bd837fd595bc1f24f79aa:maps/map-raw.afdesign)
[5]  7da9021c9f0f5b8f72cfbc4c6459f5fb02d35b6f (refs/tags/oldSystem)
[6]  c006f4d25d202b628454f77b81a94d6754ec35fd (c87084c2b4c073cc9b6661c2cb88ae9a7b265adf^{tree})
[7]  d994a516da6a9807d8d20564071f4646c22ba6c8 (refs/heads/mh3^{tree})
[8]  c25b259e396ca966d97ba97715e8655736916e58 (86cb0eb5b79c1e4999a1b8ce1d18f464c0c55d10^{tree})
[9]  a3aad3932695700d36861c52303cc6376163559c (d62b5a8952ab9feaa07ffc91a0638b3cbd94f7f9^{tree})
[10] 512c2a8b4891ed63ccfd02cefb6f3e1f37f1372c (495e64eb4f6337054c883215b16c7d83b1d99f41^{tree})
```

## 対応

```shell
$python "~/git-filter-repo.py" --path-glob '*.afdesign' --invert-paths

NOTICE: Removing 'origin' remote; see 'Why is my origin removed?'
        in the manual if you want to push back there.
        (was https://github.com/nishi-developers/schoolMaps.git)
Parsed 696 commits
New history written in 1.41 seconds; now repacking/cleaning...
Repacking your repo and cleaning out old unneeded objects
HEAD is now at 9879947 Update README.md
Enumerating objects: 4989, done.
Counting objects: 100% (4989/4989), done.
Delta compression using up to 6 threads
Compressing objects: 100% (1560/1560), done.
Writing objects: 100% (4989/4989), done.
Total 4989 (delta 3334), reused 4976 (delta 3325), pack-reused 0 (from 0)
Completely finished after 4.09 seconds.
```

- `.gitignore`に`.afdesign`を追加

## 対応後

```shell
$ git count-objects -vH

count: 0
size: 0 bytes
in-pack: 4989
packs: 1
size-pack: 165.52 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

```shell
$ git-sizer -v

Processing blobs: 1620
Processing trees: 2676
Processing commits: 692
Matching commits to trees: 692
Processing annotated tags: 1
Processing references: 10

| Name                         | Value     | Level of concern               |
| ---------------------------- | --------- | ------------------------------ |
| Overall repository size      |           |                                |
| * Commits                    |           |                                |
|   * Count                    |   692     |                                |
|   * Total size               |   208 KiB |                                |
| * Trees                      |           |                                |
|   * Count                    |  2.68 k   |                                |
|   * Total size               |   741 KiB |                                |
|   * Total tree entries       |  20.3 k   |                                |
| * Blobs                      |           |                                |
|   * Count                    |  1.62 k   |                                |
|   * Total size               |   223 MiB |                                |
| * Annotated tags             |           |                                |
|   * Count                    |     1     |                                |
| * References                 |           |                                |
|   * Count                    |    10     |                                |
|     * Branches               |     2     |                                |
|     * Tags                   |     8     |                                |
|                              |           |                                |
| Biggest objects              |           |                                |
| * Commits                    |           |                                |
|   * Maximum size         [1] |  2.07 KiB |                                |
|   * Maximum parents      [2] |     2     |                                |
| * Trees                      |           |                                |
|   * Maximum entries      [3] |    57     |                                |
| * Blobs                      |           |                                |
|   * Maximum size         [4] |  26.5 MiB | **                             |
|                              |           |                                |
| History structure            |           |                                |
| * Maximum history depth      |   657     |                                |
| * Maximum tag depth      [5] |     1     |                                |
|                              |           |                                |
| Biggest checkouts            |           |                                |
| * Number of directories  [6] |    46     |                                |
| * Maximum path depth     [7] |     5     |                                |
| * Maximum path length    [8] |    64 B   |                                |
| * Number of files        [9] |   338     |                                |
| * Total size of files   [10] |   171 MiB |                                |
| * Number of symlinks         |     0     |                                |
| * Number of submodules       |     0     |                                |

[1]  94c2e5a7a406781bca2c4cec85a8d99e457e75dd
[2]  9c75f35b2fb827670e61c14f583be7fceace26ba
[3]  c45f06898a68af579916a87e4a0ce38dce830e58 (2facc9b3a9ce829a5193c998bd61ac2d4214fe51:frontend/public/img/places)
[4]  6c71cc5973e91dd859dce8f4d873d878984b8721 (a7266e97495a1c7833a117e93c3068a93c4e6931:maps/map-raw.svg)
[5]  a4e31d0d1e849a3c587f6c6834beb6d2723398a8 (refs/tags/oldSystem)
[6]  a285dcd88a57c9e6cdd24e56d43ddc064bf67531 (5248e54ca5ef7653bd399414b048d9ee26f42eb8^{tree})
[7]  5cfdebdc43c873f7aa07d7ffd41c5752beaa3021 (refs/heads/mh3^{tree})
[8]  70e20a0a6b0456813c11d72d55eabb89c6bb4426 (d1e4e44613f37c80499c5dc1e9aa161336f32762^{tree})
[9]  b3bf502071cc7615c1982c61449b50508d8a7534 (64368043b7d1318e196be145d9b9f282f6408596^{tree})
[10] 076424e435b1d22676e7bb38a52d144d2c7f1280 (4be7d8577ea3cdfe3e31143c87b401f49a57b083^{tree})
```
